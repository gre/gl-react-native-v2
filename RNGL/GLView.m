
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTConvert.h"
#import "RCTLog.h"
#import "GLView.h"
#import "GLUtils.h"
#import "GLShader.h"
#import "GLShadersRegistry.h"
#import "GLTexture.h"
#import "GLReactImage.h"

@implementation GLView
{
  RCTBridge *_bridge; // bridge is required to instanciate GLReactImage

  GLShader *glShader; // The current GLShader used by the view
  NSDictionary *_uniforms; // The current uniforms bound to the shader (name -> value)
  NSArray *_targetUniforms; // When using GL.Target, this defines the uniform names to render into
  
  NSDictionary *_textures; // This allocate the sampler2D uniforms of the shaders (name -> glTexture)
  NSDictionary *_textureUnits; // This stores the image unit for a given sampler2D uniform (name -> int)
  
  NSDictionary *_images; // This caches the currently used images (imageSrc -> GLReactImage)
  
  BOOL _opaque; // opaque prop (if false, the GLView will become transparent)
  
  BOOL _deferredRendering; // This flag indicates a render has been deferred to the next frame (when using GL.Target)
}


- (instancetype)initWithBridge:(RCTBridge *)bridge
{
  if ((self = [super init])) {
    _bridge = bridge;
    _images = @{};
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-init)

- (void)setShader:(NSNumber *)ctxid
{
  glShader = [GLShadersRegistry getShader:ctxid];
  if (!glShader) {
    return; // the shader might not have been uploaded yet from the JS (invalid ctxid are checked on JS side to avoid concurrency issues)
  }
  
  [glShader bind];
  
  // Cache the textures
  NSMutableDictionary *textures = @{}.mutableCopy;
  NSMutableDictionary *textureUnits = @{}.mutableCopy;
  int unit = 0;
  NSDictionary *uniformTypes = [glShader uniformTypes];
  for (NSString *uniformName in [uniformTypes allKeys]) {
    GLenum type = [uniformTypes[uniformName] intValue];
    if (type == GL_SAMPLER_2D || type == GL_SAMPLER_CUBE) {
      textures[uniformName] = [[GLTexture alloc] init];
      textureUnits[uniformName] = [NSNumber numberWithInt: unit ++];
    }
  }
  int maxTextureUnits;
  glGetIntegerv(GL_MAX_TEXTURE_IMAGE_UNITS, &maxTextureUnits);
  if (unit > maxTextureUnits) {
    RCTLogError(@"Maximum number of texture reach. got %i >= max %i", unit, maxTextureUnits);
  }
  _textures = textures;
  _textureUnits = textureUnits;
  
  [self setContext:glShader.context]; // use the shader's context (currently it is the same for all shaders)
  [self setUniforms:_uniforms]; // Ensure uniforms are not set before
  [self setNeedsDisplay];
}

NSString* srcResource (id res)
{
  NSString *src;
  if ([res isKindOfClass:[NSString class]]) {
    src = [RCTConvert NSString:res];
  } else {
    BOOL isStatic = [RCTConvert BOOL:res[@"isStatic"]];
    src = [RCTConvert NSString:res[@"path"]];
    if (!src || isStatic) src = [RCTConvert NSString:res[@"uri"]];
  }
  return src;
}

- (void)setUniforms:(NSDictionary *)uniforms
{
  /// Diff logic on texture uniforms to manage the _images cache.
  
  NSMutableSet *currentResources = [[NSMutableSet alloc] init];
  NSMutableDictionary *images = _images.mutableCopy;
  
  for (NSString *name in [_uniforms allKeys]) {
    id uniformValue = _uniforms[name];
    
    GLTexture *texture = _textures[name];
    if (texture) {
      // Texture uniform
      NSString *src = srcResource(uniformValue);
      if (!src) {
        RCTLogError(@"resource is not valid.");
        return;
      }
      GLReactImage *image = _images[src];
      if (!image) {
        image = [[GLReactImage alloc] initWithBridge:_bridge withOnLoad:^{
          [self setNeedsDisplay];
        }];
        images[src] = image;
      }
      image.src = src;
      [currentResources addObject:src];
    }
  }
  
  // remove old resources (that are not anymore used in new uniforms)
  NSMutableSet *toDelete = [NSMutableSet setWithArray:[images allKeys]];
  [toDelete minusSet:currentResources];
  for (NSString *src in toDelete) {
    GLReactImage *image = images[src];
    image.src = nil;
  }
  [images removeObjectsForKeys:[toDelete allObjects]];
  
  // Finally set the new state and request a rendering.
  _images = images;
  _uniforms = uniforms;
  [self setNeedsDisplay];
}

- (void)setTargetIncrement:(NSNumber *)targetIncrement
{
  [self setNeedsDisplay];
}

- (void)setTargetUniforms:(NSArray *)targetUniforms
{
  _targetUniforms = targetUniforms;
  [self setNeedsDisplay];
}

- (void)setOpaque:(BOOL)opaque
{
  _opaque = opaque;
  [self setNeedsDisplay];
}


- (void)drawRect:(CGRect)rect
{
  BOOL needsDeferredRendering = _targetUniforms != nil;
  if (needsDeferredRendering && !_deferredRendering) {
    dispatch_async(dispatch_get_main_queue(), ^{
      _deferredRendering = true;
      [self setNeedsDisplay];
    });
  }
  else {
    [self render:rect];
    _deferredRendering = false;
  }
}

- (void)render:(CGRect)rect
{
  if (!glShader) {
    return;
  }
  
  self.layer.opaque = _opaque;
  
  [glShader bind];

  // Setting uniforms
  for (NSString *name in [_uniforms allKeys]) {
    id uniformValue = _uniforms[name];
    
    GLTexture *texture = _textures[name];
    if (texture) {
      // Texture uniform
      int unit = [_textureUnits[name] intValue];
      GLReactImage *image = _images[srcResource(uniformValue)];
      NSNumber *value = [NSNumber numberWithInt: [texture bind:unit]];
      if (image.image) {
        [texture setPixels:[image getImageData]];
      } else {
        [texture setPixelsEmpty];
      }
      [glShader setUniform:name withValue:value];
    
    } else {
      // Simple uniform
      [glShader setUniform:name withValue:uniformValue];
    }
  }
  
  // Handling <GL.Target /> children rasterisation
  if (_targetUniforms) {
    int i = 0;
    for (NSString *uniformName in _targetUniforms) {
      GLTexture *texture = _textures[uniformName];
      if (!texture) {
        RCTLogError(@"There is no sampler uniform called '%@' in your shader", uniformName);
        return;
      }
      UIView* view = self.superview.subviews[i]; // We take siblings by index (closely related to the JS code)
      int unit = [_textureUnits[uniformName] intValue];
      NSNumber *value = [NSNumber numberWithInt: [texture bind:unit]];
      if (view) {
        [texture setPixelsWithView:view];
      } else {
        [texture setPixelsEmpty];
      }
      [glShader setUniform:uniformName withValue:value];
      i ++;
    }
  }
  
  glClear(GL_COLOR_BUFFER_BIT);
  glClearColor(0.0, 0.0,  0.0,  0.0);
  
  CGFloat scale = RCTScreenScale();
  glViewport(0, 0, scale * self.frame.size.width, scale * self.frame.size.height);
  glScissor(scale * rect.origin.x, scale * rect.origin.y, scale * rect.size.width, scale * rect.size.height);
  glDrawArrays(GL_TRIANGLES, 0, 6);
}



@end
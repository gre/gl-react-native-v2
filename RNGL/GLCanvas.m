
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTConvert.h"
#import "RCTLog.h"
#import "GLCanvas.h"
#import "GLShader.h"
#import "GLShadersRegistry.h"
#import "GLTexture.h"
#import "GLImage.h"
#import "GLRenderData.h"

// For reference, see implementation of gl-shader's GLCanvas

@implementation GLCanvas
{
  RCTBridge *_bridge; // bridge is required to instanciate GLReactImage

  GLRenderData *_renderData;
  
  NSArray *_targetTextures;
  NSDictionary *_images; // This caches the currently used images (imageSrc -> GLReactImage)
  
  BOOL _opaque; // opaque prop (if false, the GLCanvas will become transparent)
  
  BOOL _deferredRendering; // This flag indicates a render has been deferred to the next frame (when using GL.Target)
  
  GLint defaultFBO;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge
                   withContext:(EAGLContext*)context
{
  if ((self = [super init])) {
    _bridge = bridge;
    _images = @{};
    self.context = context;
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-init)


- (void)setOpaque:(BOOL)opaque
{
  _opaque = opaque;
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

- (void)setData:(GLData *)data
{
  _data = data;
  [self requestSyncData];
}

- (void)requestSyncData
{
  [self syncData];
}

- (void)syncData
{
  [EAGLContext setCurrentContext:self.context];
  @autoreleasepool {
  
    NSDictionary *prevImages = _images;
    NSMutableDictionary *images = [[NSMutableDictionary alloc] init];
    
    GLRenderData * (^traverseTree) (GLData *data, int frameIndex);
    __block __weak GLRenderData * (^weak_traverseTree)(GLData *data, int frameIndex);
    weak_traverseTree = traverseTree = ^GLRenderData *(GLData *data, int frameIndex) {
      NSNumber *width = data.width;
      NSNumber *height = data.height;
      
      // Traverse children and compute GLRenderData
      NSMutableArray *children = [[NSMutableArray alloc] init];
      NSMutableDictionary *fbosMapping = [[NSMutableDictionary alloc] init];
      int fboId = 0;
      int i = 0;
      for (GLData *child in data.children) {
        if (fboId == frameIndex) fboId ++;
        fbosMapping[[NSNumber numberWithInt:i]] = [NSNumber numberWithInt:fboId];
        [children addObject:traverseTree(child, fboId)];
        fboId ++;
        i ++;
      }
      
      GLShader *shader = [GLShadersRegistry getShader:data.shader];
      
      NSDictionary *uniformTypes = [shader uniformTypes];
      NSMutableDictionary *uniforms = [[NSMutableDictionary alloc] init];
      NSMutableDictionary *textures = [[NSMutableDictionary alloc] init];
      int units = 0;
      for (NSString *uniformName in data.uniforms) {
        id value = [data.uniforms objectForKey:uniformName];
        GLenum type = [uniformTypes[uniformName] intValue];
        
        if (value && (type == GL_SAMPLER_2D || type == GL_SAMPLER_CUBE)) {
          uniforms[uniformName] = [NSNumber numberWithInt:units++];
          NSString *type = [RCTConvert NSString:value[@"type"]];
          if ([type isEqualToString:@"target"]) {
            int id = [[RCTConvert NSNumber:value[@"id"]] intValue];
            if (id >= [_targetTextures count]) {
              [self resizeTargets:id+1];
            }
            textures[uniformName] = _targetTextures[id];
          }
          else if ([type isEqualToString:@"framebuffer"]) {
            NSNumber *id = fbosMapping[[RCTConvert NSNumber:value[@"id"]]];
            GLFBO *fbo = [GLShadersRegistry getFBO:id];
            textures[uniformName] = fbo.color[0];
          }
          else if ([type isEqualToString:@"image"]) {
            NSObject *val = value[@"value"];
            NSString *src = srcResource(val);
            if (!src) {
              RCTLogError(@"invalid uniform '%@' texture value '%@'", uniformName, value);
            }
           
            GLImage *image = images[src];
            if (image == nil) {
              image = prevImages[src];
              if (image != nil)
                images[src] = image;
            }
            if (image == nil) {
              image = [[GLImage alloc] initWithBridge:_bridge withOnLoad:^{
                [self setNeedsDisplay];
              }];
              image.src = src;
              images[src] = image;
            }
            textures[uniformName] = [image getTexture];
          }
          else {
            RCTLogError(@"invalid uniform '%@' value of type '%@'", uniformName, type);
          }
        }
        else {
          uniforms[uniformName] = value;
        }
      }
      
      int maxTextureUnits;
      glGetIntegerv(GL_MAX_TEXTURE_IMAGE_UNITS, &maxTextureUnits);
      if (units > maxTextureUnits) {
        RCTLogError(@"Maximum number of texture reach. got %i >= max %i", units, maxTextureUnits);
      }
      
      for (NSString *uniformName in shader.uniformTypes) {
        if (uniforms[uniformName] == nil) {
          RCTLogError(@"All defined uniforms must be provided. Missing '%@'", uniformName);
        }
      }

      return [[GLRenderData alloc] initWithShader:shader withUniforms:uniforms withTextures:textures withWidth:width withHeight:height withFrameIndex:frameIndex withChildren:children];
    };
    
    _renderData = traverseTree(_data, -1);
    _images = images;
    
    [self setNeedsDisplay];
  }
}

- (void)setNbTargets:(NSNumber *)nbTargets
{
  [self resizeTargets:[nbTargets intValue]];
}

- (void)resizeTargets:(int)n
{
  [EAGLContext setCurrentContext:self.context];
  int length = (int) [_targetTextures count];
  if (length == n) return;
  if (n < length) {
    _targetTextures = [_targetTextures subarrayWithRange:NSMakeRange(0, n)];
  }
  else {
    NSMutableArray *targetTextures = [[NSMutableArray alloc] initWithArray:_targetTextures];
    for (int i = (int) [_targetTextures count]; i < n; i++) {
      [targetTextures addObject:[[GLTexture alloc] init]];
    }
    _targetTextures = targetTextures;
  }
}


- (void)syncTargetTextures
{
  int i = 0;
  for (GLTexture *texture in _targetTextures) {
    UIView* view = self.superview.subviews[i]; // We take siblings by index (closely related to the JS code)
    if (view) {
      [texture setPixelsWithView:view];
    } else {
      [texture setPixelsEmpty];
    }
    i ++;
  }
}

- (void)drawRect:(CGRect)rect
{
  BOOL needsDeferredRendering = _nbTargets > 0;
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
  if (!_renderData) return;
  
  self.layer.opaque = _opaque;
  
  CGFloat scale = RCTScreenScale();
  
  @autoreleasepool {
    void (^recDraw) (GLRenderData *renderData);
    __block __weak void (^weak_recDraw) (GLRenderData *renderData);
    weak_recDraw = recDraw = ^void(GLRenderData *renderData) {
      float w = [renderData.width floatValue] * scale;
      float h = [renderData.height floatValue] * scale;
      
      for (GLRenderData *child in renderData.children)
        recDraw(child);
      
      if (renderData.frameIndex == -1) {
        glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
        glViewport(0, 0, w, h);
      }
      else {
        GLFBO *fbo = [GLShadersRegistry getFBO:[NSNumber numberWithInt:renderData.frameIndex]];
        [fbo setShapeWithWidth:w withHeight:h];
        [fbo bind];
      }
      
      glClear(GL_COLOR_BUFFER_BIT);
      glClearColor(0.0, 0.0,  0.0,  0.0);
      
      [renderData.shader bind];
      
      for (NSString *uniformName in renderData.textures) {
        GLTexture *texture = renderData.textures[uniformName];
        int unit = [((NSNumber *)renderData.uniforms[uniformName]) intValue];
        [texture bind:unit];
      }
      
      for (NSString *uniformName in renderData.uniforms) {
        [renderData.shader setUniform:uniformName withValue:renderData.uniforms[uniformName]];
      }
      
      glDrawArrays(GL_TRIANGLES, 0, 6);
    };
    
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &defaultFBO);
    
    [self syncTargetTextures];
    
    recDraw(_renderData);
    
    glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
  }
}



@end
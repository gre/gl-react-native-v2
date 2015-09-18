
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTLog.h"
#import "GLCanvas.h"
#import "GLShader.h"
#import "GLShadersRegistry.h"
#import "GLTexture.h"
#import "GLImage.h"
#import "GLRenderData.h"
#import "UIView+React.h"

// For reference, see implementation of gl-shader's GLCanvas

@implementation GLCanvas
{
  RCTBridge *_bridge; // bridge is required to instanciate GLReactImage
  
  GLRenderData *_renderData;
  
  NSArray *_contentTextures;
  NSDictionary *_images; // This caches the currently used images (imageSrc -> GLReactImage)
  
  BOOL _opaque; // opaque prop (if false, the GLCanvas will become transparent)
  
  BOOL _deferredRendering; // This flag indicates a render has been deferred to the next frame (when using contents)
  
  GLint defaultFBO;
  
  NSMutableArray *_preloaded;
  BOOL _preloadingDone;
  
  CADisplayLink *displayLink;
  
  NSTimer *animationTimer;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge
                   withContext:(EAGLContext *)context
{
  if ((self = [super init])) {
    _bridge = bridge;
    _images = @{};
    _preloaded = [[NSMutableArray alloc] init];
    _preloadingDone = false;
    self.context = context;
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-init)

-(void)setImagesToPreload:(NSArray *)imagesToPreload
{
  if (_preloadingDone) return;
  if ([imagesToPreload count] == 0) {
    [self dispatchOnLoad];
    _preloadingDone = true;
  }
  else {
    _preloadingDone = false;
  }
  _imagesToPreload = imagesToPreload;
}

- (void)dispatchOnLoad
{
  if (_onLoad) {
    [_bridge.eventDispatcher sendInputEventWithName:@"load" body:@{ @"target": self.reactTag }];
  }
}

- (void)dispatchOnProgress: (double)progress withLoaded:(int)loaded withTotal:(int)total
{
  if (_onProgress) {
    NSDictionary *event =
  @{
    @"target": self.reactTag,
    @"progress": @(progress),
    @"loaded": @(loaded),
    @"total": @(total) };
    [_bridge.eventDispatcher sendInputEventWithName:@"progress" body:event];
  }
}

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

- (void)setRenderId:(NSNumber *)renderId
{
  if (_nbContentTextures > 0) {
    [self setNeedsDisplay];
  }
}

- (void)setAutoRedraw:(BOOL)autoRedraw
{
  if (autoRedraw) {
    if (!animationTimer)
      animationTimer = // FIXME: can we do better than this?
      [NSTimer scheduledTimerWithTimeInterval:1.0/60.0
                                       target:self
                                     selector:@selector(setNeedsDisplay)
                                     userInfo:nil
                                      repeats:YES];
  }
  else {
    if (animationTimer) {
      [animationTimer invalidate];
    }
  }
}

- (void)setEventsThrough:(BOOL)eventsThrough
{
  self.userInteractionEnabled = !eventsThrough;
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
    
    GLRenderData * (^traverseTree) (GLData *data);
    __block __weak GLRenderData * (^weak_traverseTree)(GLData *data);
    weak_traverseTree = traverseTree = ^GLRenderData *(GLData *data) {
      NSNumber *width = data.width;
      NSNumber *height = data.height;
      int fboId = [data.fboId intValue];
      
      NSMutableArray *contextChildren = [[NSMutableArray alloc] init];
      for (GLData *child in data.contextChildren) {
        [contextChildren addObject:weak_traverseTree(child)];
      }
      
      NSMutableArray *children = [[NSMutableArray alloc] init];
      for (GLData *child in data.children) {
        [children addObject:weak_traverseTree(child)];
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
          if ([type isEqualToString:@"content"]) {
            int id = [[RCTConvert NSNumber:value[@"id"]] intValue];
            if (id >= [_contentTextures count]) {
              [self resizeUniformContentTextures:id+1];
            }
            textures[uniformName] = _contentTextures[id];
          }
          else if ([type isEqualToString:@"framebuffer"]) {
            NSNumber *id = [RCTConvert NSNumber:value[@"id"]];
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
                [self onImageLoad:src];
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
      
      return [[GLRenderData alloc]
              initWithShader:shader
              withUniforms:uniforms
              withTextures:textures
              withWidth:width
              withHeight:height
              withFboId:fboId
              withContextChildren:contextChildren
              withChildren:children];
    };
    
    _renderData = traverseTree(_data);
    _images = images;
    
    [self setNeedsDisplay];
  }
}

- (int)countPreloaded
{
  int nb = 0;
  for (id toload in _imagesToPreload) {
    if ([_preloaded containsObject:srcResource(toload)])
      nb++;
  }
  return nb;
}

- (void)onImageLoad:(NSString *)loaded
{
  if (!_preloadingDone) {
    [_preloaded addObject:loaded];
    int count = [self countPreloaded];
    int total = (int) [_imagesToPreload count];
    double progress = ((double) count) / ((double) total);
    [self dispatchOnProgress:progress withLoaded:count withTotal:total];
    if (count == total) {
      [self dispatchOnLoad];
      _preloadingDone = true;
      [self requestSyncData];
    }
  }
  else {
    // Any texture image load will trigger a future re-sync of data (if no preloaded)
    [self requestSyncData];
  }
}

- (void)setNbContentTextures:(NSNumber *)nbContentTextures
{
  [self resizeUniformContentTextures:[nbContentTextures intValue]];
  _nbContentTextures = nbContentTextures;
}

- (void)resizeUniformContentTextures:(int)n
{
  [EAGLContext setCurrentContext:self.context];
  int length = (int) [_contentTextures count];
  if (length == n) return;
  if (n < length) {
    _contentTextures = [_contentTextures subarrayWithRange:NSMakeRange(0, n)];
  }
  else {
    NSMutableArray *contentTextures = [[NSMutableArray alloc] initWithArray:_contentTextures];
    for (int i = (int) [_contentTextures count]; i < n; i++) {
      [contentTextures addObject:[[GLTexture alloc] init]];
    }
    _contentTextures = contentTextures;
  }
}


- (void)syncContentTextures
{
  int i = 0;
  for (GLTexture *texture in _contentTextures) {
    UIView* view = self.superview.subviews[i]; // We take siblings by index (closely related to the JS code)
    if (view) {
      if ([view.subviews count] == 1)
        [texture setPixelsWithView:view.subviews[0]];
      else
        [texture setPixelsWithView:view];
    } else {
      [texture setPixelsEmpty];
    }
    i ++;
  }
}

- (void)drawRect:(CGRect)rect
{
  
  if (!_preloadingDone) {
    glClearColor(0.0, 0.0, 0.0, 0.0);
    glClear(GL_COLOR_BUFFER_BIT);
    return;
  }
  BOOL needsDeferredRendering = _nbContentTextures > 0 && !_autoRedraw;
  if (needsDeferredRendering && !_deferredRendering) {
    dispatch_async(dispatch_get_main_queue(), ^{
      _deferredRendering = true;
      [self setNeedsDisplay];
    });
  }
  else {
    [self render];
    _deferredRendering = false;
  }
}

- (void)render
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
      
      for (GLRenderData *child in renderData.contextChildren)
        weak_recDraw(child);
      
      for (GLRenderData *child in renderData.children)
        weak_recDraw(child);
      
      if (renderData.fboId == -1) {
        glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
        glViewport(0, 0, w, h);
      }
      else {
        GLFBO *fbo = [GLShadersRegistry getFBO:[NSNumber numberWithInt:renderData.fboId]];
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
    
    [self syncContentTextures];
    
    recDraw(_renderData);
    
    glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
  }
}



@end
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTProfile.h>
#import <React/RCTImageSource.h>
#import "RNGLContext.h"
#import "GLCanvas.h"
#import "GLShader.h"
#import "GLTexture.h"
#import "GLImage.h"
#import "GLRenderData.h"
#import <React/UIView+React.h>

NSString* imageSourceHash (RCTImageSource *is) {
  return is.request.URL;
}

NSArray* diff (NSArray* a, NSArray* b) {
  NSMutableArray *arr = [[NSMutableArray alloc] init];
  for (NSString* k in a) {
    if (![b containsObject:k]) {
      [arr addObject:k];
    }
  }
  return arr;
}

// For reference, see implementation of gl-shader's GLCanvas

@implementation GLCanvas
{
  RCTBridge *_bridge;

  GLRenderData *_renderData;

  NSArray *_contentData;
  NSArray *_contentTextures;
  NSDictionary *_images; // This caches the currently used images (imageSrc -> GLReactImage)

  BOOL _deferredRendering; // This flag indicates a render has been deferred to the next frame (when using contents)

  GLint defaultFBO;

  NSMutableArray *_preloaded;
  BOOL _dirtyOnLoad;
  BOOL _neverRendered;

  NSTimer *animationTimer;

  BOOL _needSync;

  NSMutableArray *_captureConfigs;
  BOOL _captureScheduled;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge
{
  if ((self = [super init])) {
    _bridge = bridge;
    _images = @{};
    _preloaded = [[NSMutableArray alloc] init];
    _captureConfigs = [[NSMutableArray alloc] init];
    _captureScheduled = false;
    _dirtyOnLoad = true;
    _neverRendered = true;
    self.context = [bridge.rnglContext getContext];
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-init)

- (void)dealloc
{
  _bridge = nil;
  _images = nil;
  _preloaded = nil;
  _captureConfigs = nil;
  _contentData = nil;
  _contentTextures = nil;
  _data = nil;
  _renderData = nil;
  if (animationTimer) {
    [animationTimer invalidate];
    animationTimer = nil;
  }
}

//// Props Setters

- (void) requestCaptureFrame: (CaptureConfig *)config
{
  [self setNeedsDisplay];
  for (CaptureConfig *existing in _captureConfigs) {
    if ([existing isEqualToCaptureConfig:config]) {
      return;
    }
  }
  [_captureConfigs addObject:config];
}

-(void)setImagesToPreload:(NSArray *)imagesToPreload
{
  _imagesToPreload = imagesToPreload;
  [self requestSyncData];
}

- (void)setRenderId:(NSNumber *)renderId
{
  if ([_nbContentTextures intValue] > 0) {
    [self setNeedsDisplay];
  }
}

- (void)setAutoRedraw:(BOOL)autoRedraw
{
  _autoRedraw = autoRedraw;
  [self performSelectorOnMainThread:@selector(syncAutoRedraw) withObject:nil waitUntilDone:false];
}

- (void)syncAutoRedraw
{
  if (_autoRedraw) {
    if (!animationTimer)
      animationTimer =
      [NSTimer scheduledTimerWithTimeInterval:1.0/60.0
                                       target:self
                                     selector:@selector(autoRedrawUpdate)
                                     userInfo:nil
                                      repeats:YES];
  }
  else {
    if (animationTimer) {
      [animationTimer invalidate];
    }
  }
}

- (void)setPointerEvents:(RCTPointerEvents)pointerEvents
{
  self.userInteractionEnabled = (pointerEvents != RCTPointerEventsNone);
  if (pointerEvents == RCTPointerEventsBoxNone) {
    self.accessibilityViewIsModal = NO;
  }
}

- (void)setPixelRatio:(NSNumber *)pixelRatio
{
  self.contentScaleFactor = [pixelRatio floatValue];
  [self setNeedsDisplay];
}

- (void)setData:(GLData *)data
{
  _data = data;
  _renderData = nil;
  [self requestSyncData];
}

- (void)setNbContentTextures:(NSNumber *)nbContentTextures
{
  _nbContentTextures = nbContentTextures;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  CGFloat alpha = CGColorGetAlpha(backgroundColor.CGColor);
  self.opaque = (alpha == 1.0);
}

//// Sync methods (called from props setters)

- (void)requestSyncData
{
  _needSync = true;
  [self setNeedsDisplay];
}

- (bool)syncData:(NSError **)error
{
  @autoreleasepool {

    NSDictionary *prevImages = _images;
    NSMutableDictionary *images =
      self.preserveImages
      ? _images.mutableCopy
      : [[NSMutableDictionary alloc] init];

    GLRenderData * (^traverseTree) (GLData *data);
    __block __weak GLRenderData * (^weak_traverseTree)(GLData *data);
    weak_traverseTree = traverseTree = ^GLRenderData *(GLData *data) {
      NSNumber *width = data.width;
      NSNumber *height = data.height;
      NSNumber *pixelRatio = data.pixelRatio;
      int fboId = [data.fboId intValue];

      NSMutableArray *contextChildren = [[NSMutableArray alloc] init];
      for (GLData *child in data.contextChildren) {
        GLRenderData *node = weak_traverseTree(child);
        if (node == nil) return nil;
        [contextChildren addObject:node];
      }

      NSMutableArray *children = [[NSMutableArray alloc] init];
      for (GLData *child in data.children) {
        GLRenderData *node = weak_traverseTree(child);
        if (node == nil) return nil;
        [children addObject:node];
      }

      GLShader *shader = [_bridge.rnglContext getShader:data.shader];
      if (shader == nil) return nil;
      if (![shader ensureCompiles:error]) return nil;

      NSDictionary *uniformTypes = [shader uniformTypes];
      NSMutableDictionary *uniforms = [[NSMutableDictionary alloc] init];
      NSMutableDictionary *textures = [[NSMutableDictionary alloc] init];
      int units = 0;
      for (NSString *uniformName in data.uniforms) {
        id value = [data.uniforms objectForKey:uniformName];
        GLenum type = [uniformTypes[uniformName] intValue];


        if (type == GL_SAMPLER_2D || type == GL_SAMPLER_CUBE) {
          uniforms[uniformName] = [NSNumber numberWithInt:units++];
          if ([value isEqual:[NSNull null]]) {
            GLTexture *emptyTexture = [[GLTexture alloc] init];
            [emptyTexture setPixels:nil];
            textures[uniformName] = emptyTexture;
          }
          else if ([value isKindOfClass:[NSNumber class]]) {
            RCTLogError(@"texture uniform '%@': you cannot directly give require('./img.png') to gl-react, use resolveAssetSource(require('./img.png')) instead.", uniformName);
          }
          else {
            NSString *type = [RCTConvert NSString:value[@"type"]];
            if ([type isEqualToString:@"content"]) {
              int id = [[RCTConvert NSNumber:value[@"id"]] intValue];
              if (id >= [_contentTextures count]) {
                [self resizeUniformContentTextures:id+1];
              }
              textures[uniformName] = _contentTextures[id];
            }
            else if ([type isEqualToString:@"fbo"]) {
              NSNumber *id = [RCTConvert NSNumber:value[@"id"]];
              GLFBO *fbo = [_bridge.rnglContext getFBO:id];
              textures[uniformName] = fbo.color[0];
            }
            else if ([type isEqualToString:@"uri"]) {
              RCTImageSource *src = [RCTConvert RCTImageSource:value];
              if (!src) {
                GLTexture *emptyTexture = [[GLTexture alloc] init];
                [emptyTexture setPixels:nil];
                textures[uniformName] = emptyTexture;
              }
              else {
                NSString *key = imageSourceHash(src);
                GLImage *image = images[key];
                if (image == nil) {
                  image = prevImages[key];
                  if (image != nil)
                    images[key] = image;
                }
                if (image == nil) {
                  __weak GLCanvas *weakSelf = self;
                  image = [[GLImage alloc] initWithBridge:_bridge withOnLoad:^{
                    if (weakSelf) [weakSelf onImageLoad:src];
                  }];
                  image.source = src;
                  images[key] = image;
                }
                textures[uniformName] = [image getTexture];
              }
            }
            else {
              RCTLogError(@"texture uniform '%@': Unexpected type '%@'", uniformName, type);
            }
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

      for (NSString *uniformName in shader.uniformNames) {
        if (uniforms[uniformName] == nil) {
          RCTLogError(@"All defined uniforms must be provided. Missing '%@'", uniformName);
        }
      }

      return [[GLRenderData alloc]
              initWithShader:shader
              withUniforms:uniforms
              withTextures:textures
              withWidth:(int)([width floatValue] * [pixelRatio floatValue])
              withHeight:(int)([height floatValue] * [pixelRatio floatValue])
              withFboId:fboId
              withContextChildren:contextChildren
              withChildren:children];
    };

    GLRenderData *res = traverseTree(_data);
    if (res != nil) {
      _renderData = traverseTree(_data);
      _images = images;
      for (NSString *src in diff([prevImages allKeys], [images allKeys])) {
        [_preloaded removeObject:src];
      }
      return true;
    }
    else {
      return false;
    }
  }
}

- (void)syncContentData
{
  RCT_PROFILE_BEGIN_EVENT(0, @"GLCanvas syncContentData", nil);
  NSMutableArray *contentData = [[NSMutableArray alloc] init];
  int nb = [_nbContentTextures intValue];
  for (int i = 0; i < nb; i++) {
    UIView *view = self.superview.subviews[i]; // We take siblings by index (closely related to the JS code)
    GLImageData *imgData = nil;
    if (view) {
      UIView *v = [view.subviews count] == 1 ?
      view.subviews[0] :
      view;
      imgData = [GLImageData genPixelsWithView:v withPixelRatio:self.contentScaleFactor];
    } else {
      imgData = nil;
    }
    if (imgData) contentData[i] = imgData;
  }
  _contentData = contentData;
  [self setNeedsDisplay];
  RCT_PROFILE_END_EVENT(0, @"gl");
}


- (void)syncContentTextures
{
  unsigned long max = MIN([_contentData count], [_contentTextures count]);
  for (int i=0; i<max; i++) {
    [_contentTextures[i] setPixels:_contentData[i]];
  }
}

- (BOOL)haveRemainingToPreload
{
  for (id res in _imagesToPreload) {
    if (![_preloaded containsObject:imageSourceHash([RCTConvert RCTImageSource:res])]) {
      return true;
    }
  }
  return false;
}


//// Draw

- (void) autoRedrawUpdate
{
  if ([self haveRemainingToPreload]) {
    return;
  }
  if ([_nbContentTextures intValue] > 0) {
    [self syncContentData];
  }
  [self setNeedsDisplay];
}

- (void)drawRect:(CGRect)rect
{
  if (_neverRendered) {
    _neverRendered = false;
    glClearColor(0.0, 0.0, 0.0, 0.0);
    glClear(GL_COLOR_BUFFER_BIT);
  }

  if (_needSync) {
    NSError *error;
    BOOL syncSuccessful = [self syncData:&error];
    BOOL errorCanBeRecovered = error==nil || (error.code != GLLinkingFailure && error.code != GLCompileFailure);
    if (!syncSuccessful && errorCanBeRecovered) {
      // something failed but is recoverable, retry in one tick
      [self performSelectorOnMainThread:@selector(setNeedsDisplay) withObject:nil waitUntilDone:NO];
    }
    else {
      _needSync = false;
    }
  }

  if ([self haveRemainingToPreload]) {
    return;
  }

  BOOL needsDeferredRendering = [_nbContentTextures intValue] > 0 && !_autoRedraw;
  if (needsDeferredRendering && !_deferredRendering) {
    _deferredRendering = true;
    [self performSelectorOnMainThread:@selector(syncContentData) withObject:nil waitUntilDone:NO];
  }
  else {
    _deferredRendering = false;
    [self render];
    if (!_captureScheduled && [_captureConfigs count] > 0) {
      _captureScheduled = true;
      [self performSelectorOnMainThread:@selector(capture) withObject:nil waitUntilDone:NO];
    }
  }
}

-(void) capture
{
  _captureScheduled = false;
  if (!self.onGLCaptureFrame) return;

  UIImage *frameImage = [self snapshot];

  for (CaptureConfig *config in _captureConfigs) {
    id result;
    id error;

    BOOL isPng = [config.type isEqualToString:@"png"];
    BOOL isJpeg = !isPng && ([config.type isEqualToString:@"jpeg"] || [config.type isEqualToString:@"jpg"]);

    BOOL isBase64 = [config.format isEqualToString:@"base64"];
    BOOL isFile = !isBase64 && [config.format isEqualToString:@"file"];

    NSData *frameData =
    isPng ? UIImagePNGRepresentation(frameImage) :
    isJpeg ? UIImageJPEGRepresentation(frameImage, [config.quality floatValue]) :
    nil;

    if (!frameData) {
      error = [NSString stringWithFormat:@"Unsupported capture type '%@'", config.type];
    }
    else if (isBase64) {
      NSString *base64 = [frameData base64EncodedStringWithOptions: NSDataBase64Encoding64CharacterLineLength];
      result = [NSString stringWithFormat:@"data:image/%@;base64,%@", config.type, base64];
    }
    else if (isFile) {
      NSError *e;
      if (![frameData writeToFile:config.filePath options:0 error:&e]) {
        error = [NSString stringWithFormat:@"Could not write file: %@", e.localizedDescription];
      }
      else {
        result = [NSString stringWithFormat:@"file://%@", config.filePath];
      }
    }
    else {
      error = [NSString stringWithFormat:@"Unsupported capture format '%@'", config.format];
    }

    NSMutableDictionary *response = [[NSMutableDictionary alloc] init];
    response[@"config"] = [config dictionary];
    if (error) response[@"error"] = error;
    if (result) response[@"result"] = result;
    self.onGLCaptureFrame(response);
  }

  _captureConfigs = [[NSMutableArray alloc] init];
}

- (void)render
{
  GLRenderData *rd = _renderData;
  if (!rd) return;
  RCT_PROFILE_BEGIN_EVENT(0, @"GLCanvas render", nil);

  @autoreleasepool {

    void (^recDraw) (GLRenderData *renderData);
    __block __weak void (^weak_recDraw) (GLRenderData *renderData);
    weak_recDraw = recDraw = ^void(GLRenderData *renderData) {
      int w = renderData.width;
      int h = renderData.height;

      for (GLRenderData *child in renderData.contextChildren)
        weak_recDraw(child);

      for (GLRenderData *child in renderData.children)
        weak_recDraw(child);

      NSString *nodeName = [NSString stringWithFormat:@"node:%@", renderData.shader.name];
      RCT_PROFILE_BEGIN_EVENT(0, nodeName, nil);

      RCT_PROFILE_BEGIN_EVENT(0, @"bind fbo", nil);
      if (renderData.fboId == -1) {
        glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
        glViewport(0, 0, w, h);
        glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
      }
      else {
        GLFBO *fbo = [_bridge.rnglContext getFBO:[NSNumber numberWithInt:renderData.fboId]];
        [fbo setShapeWithWidth:w withHeight:h];
        [fbo bind];
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      }
      RCT_PROFILE_END_EVENT(0, @"gl");

      RCT_PROFILE_BEGIN_EVENT(0, @"bind shader", nil);
      [renderData.shader bind];
      RCT_PROFILE_END_EVENT(0, @"gl");

      RCT_PROFILE_BEGIN_EVENT(0, @"bind textures", nil);
      for (NSString *uniformName in renderData.textures) {
        GLTexture *texture = renderData.textures[uniformName];
        int unit = [((NSNumber *)renderData.uniforms[uniformName]) intValue];
        [texture bind:unit];
      }
      RCT_PROFILE_END_EVENT(0, @"gl");

      RCT_PROFILE_BEGIN_EVENT(0, @"bind set uniforms", nil);
      for (NSString *uniformName in renderData.uniforms) {
        [renderData.shader setUniform:uniformName withValue:renderData.uniforms[uniformName]];
      }
      RCT_PROFILE_END_EVENT(0, @"gl");

      RCT_PROFILE_BEGIN_EVENT(0, @"draw", nil);
      glClearColor(0.0, 0.0, 0.0, 0.0);
      glClear(GL_COLOR_BUFFER_BIT);
      glDrawArrays(GL_TRIANGLES, 0, 3);
      RCT_PROFILE_END_EVENT(0, @"gl");

      RCT_PROFILE_END_EVENT(0, @"gl");
    };

    // DRAWING THE SCENE

    [self syncContentTextures];

    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &defaultFBO);
    glEnable(GL_BLEND);
    recDraw(rd);
    glDisable(GL_BLEND);
    glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
    glBindBuffer(GL_ARRAY_BUFFER, 0);

    if (_dirtyOnLoad && ![self haveRemainingToPreload]) {
      _dirtyOnLoad = false;
      [self dispatchOnLoad];
    }
  }

  RCT_PROFILE_END_EVENT(0, @"gl");
}

//// utility methods

- (void)onImageLoad:(RCTImageSource *)source
{
  [_preloaded addObject:imageSourceHash(source)];
  int count = [self countPreloaded];
  int total = (int) [_imagesToPreload count];
  double progress = ((double) count) / ((double) total);
  [self dispatchOnProgress:progress withLoaded:count withTotal:total];
  _dirtyOnLoad = true;
  [self requestSyncData];
}

- (int)countPreloaded
{
  int nb = 0;
  for (id toload in _imagesToPreload) {
    if ([_preloaded containsObject:imageSourceHash([RCTConvert RCTImageSource:toload])])
      nb++;
  }
  return nb;
}

- (void)resizeUniformContentTextures:(int)n
{
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

- (void)dispatchOnLoad
{
  if (self.onGLLoad) self.onGLLoad(@{});
}

- (void)dispatchOnProgress: (double)progress withLoaded:(int)loaded withTotal:(int)total
{
  if (self.onGLProgress) self.onGLProgress(
                                           @{
                                             @"progress": @(RCTZeroIfNaN(progress)),
                                             @"loaded": @(RCTZeroIfNaN(loaded)),
                                             @"total": @(RCTZeroIfNaN(total))
                                             });
}

@end

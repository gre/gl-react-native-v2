#import "GLTexture.h"
#import "GLUtils.h"
#import "RCTLog.h"

@implementation GLTexture
{
  GLuint handle; // The identifier of the gl texture
  ImageData* dataCurrentlyUploaded; // The last set data (cache)
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    [self makeTexture];
  }
  return self;
}

- (void)dealloc
{
  glDeleteTextures(1, &handle);
  dataCurrentlyUploaded = nil;
}

- (void) makeTexture
{
  glGenTextures(1, &handle);
  glBindTexture(GL_TEXTURE_2D, handle);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
}

- (bool) ensureContext
{
  if (![EAGLContext setCurrentContext:_context]) {
    RCTLogError(@"Failed to set current OpenGL context");
    return false;
  }
  return true;
}

- (int)bind: (int)unit
{
  glActiveTexture(GL_TEXTURE0 + unit);
  glBindTexture(GL_TEXTURE_2D, handle);
  return unit;
}

- (void)setPixels: (ImageData *)data
{
  if (data != dataCurrentlyUploaded) {
    dataCurrentlyUploaded = data;
    glBindTexture(GL_TEXTURE_2D, handle);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, data.width, data.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data.data);
  }
}

- (void)setPixelsEmpty
{
  ImageData* data = genPixelsEmpty(2, 2);
  [self setPixels:data];
}

- (void)setPixelsRandom: (int)width withHeight:(int)height // for testing
{
  ImageData* data = genPixelsRandom(width, height);
  [self setPixels:data];
}

- (void)setPixelsWithImage: (UIImage *)image
{
  ImageData *data = genPixelsWithImage(image);
  if (!data) return;
  [self setPixels:data];
}

- (void)setPixelsWithView: (UIView *)view
{
  ImageData *data = genPixelsWithView(view);
  [self setPixels:data];
}


@end

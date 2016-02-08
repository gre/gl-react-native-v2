#import "GLTexture.h"
#import "RCTLog.h"
#import "RCTUtils.h"

@implementation GLTexture
{
  GLuint _handle; // The identifier of the gl texture
  GLImageData* dataCurrentlyUploaded; // The last set data (cache)
  CVPixelBufferRef bufferCurrentlyUploaded; // The last set buffer (cache)
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
  glDeleteTextures(1, &_handle);
  dataCurrentlyUploaded = nil;
  bufferCurrentlyUploaded = NULL;
}

- (void) makeTexture
{
  glGenTextures(1, &_handle);
  glBindTexture(GL_TEXTURE_2D, _handle);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
}

- (int)bind: (int)unit
{
  glActiveTexture(GL_TEXTURE0 + unit);
  glBindTexture(GL_TEXTURE_2D, _handle);
  return unit;
}

- (void)bind
{
  glBindTexture(GL_TEXTURE_2D, _handle);
}

- (void)setShapeWithWidth:(float)width withHeight:(float)height
{
  [self bind];
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
}

- (void)setPixels: (GLImageData *)data
{
  GLImageData *d = data==nil ? [GLImageData empty] : data;
  bufferCurrentlyUploaded = NULL;
  if (d != dataCurrentlyUploaded) {
    dataCurrentlyUploaded = d;
    [self bind];
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, d.width, d.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, d.data);
  }
}


- (void)setPixelsWithPixelBuffer: (CVPixelBufferRef)buffer
{
  if (buffer == NULL) {
    [self setPixels:[GLImageData empty]];
  }
  else {
    dataCurrentlyUploaded = nil;
    if (buffer != bufferCurrentlyUploaded) {
      bufferCurrentlyUploaded = buffer;
      [self bind];
      int width = (int) CVPixelBufferGetWidth(buffer);
      int height = (int) CVPixelBufferGetHeight(buffer);
      GLubyte* data = CVPixelBufferGetBaseAddress(buffer);
      glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE,  data);
    }
  }
}

@end

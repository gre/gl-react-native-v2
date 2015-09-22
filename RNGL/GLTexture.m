#import "GLTexture.h"
#import "RCTLog.h"
#import "RCTUtils.h"

GLImageData* genPixelsEmpty (int width, int height)
{
  GLubyte* data = (GLubyte *) malloc(width*height*4*sizeof(GLubyte));
  for (int i = 0; i < width * height * 4; i+=4) {
    data[i] = data[i+1] = data[i+2] = 0;
    data[i+3] = 0;
  }
  return [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
}

GLImageData* genPixelsRandom (int width, int height)
{
  GLubyte* data = (GLubyte *) malloc(width*height*4*sizeof(GLubyte));
  for (int i = 0; i < width * height * 4; i+=4) {
    data[i] = rand() % 255;
    data[i+1] = rand() % 255;
    data[i+2] = rand() % 255;
    data[i+3] = 255;
  }
  return [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
}

GLImageData* genPixelsWithImage (UIImage *image)
{
  int width = image.size.width;
  int height = image.size.height;
  if (width == 0 || height == 0) {
    RCTLogError(@"The image must be loaded in setPixelsWithImage call");
    return nil;
  }
  GLubyte* data = malloc(width * height * 4);
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(data, width, height, 8, width * 4, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  if (ctx == NULL) {
    RCTLogError(@"unable to create the bitmap context");
    CGColorSpaceRelease(colorSpace);
    free(data);
    return nil;
  }
  CGAffineTransform flipVertical = CGAffineTransformMake(1, 0, 0, -1, 0, height);
  CGContextConcatCTM(ctx, flipVertical);
  
  CGRect rect = CGRectMake(0.0, 0.0, width, height);
  CGContextClearRect(ctx, rect);
  CGContextDrawImage(ctx, rect, image.CGImage);
  CGColorSpaceRelease(colorSpace);
  CGContextRelease(ctx);
  return [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
}

GLImageData* genPixelsWithView (UIView *view)
{
  float width = RCTScreenScale() * view.bounds.size.width;
  float height = RCTScreenScale() * view.bounds.size.height;
  GLubyte *data = (GLubyte *)malloc(4 * width * height);
  CGColorSpaceRef colourSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(data, width, height, 8, 4 * width, colourSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(colourSpace);
  CGContextClearRect(ctx, CGRectMake(0.0, 0.0, width, height));
  CGContextScaleCTM(ctx, RCTScreenScale(), RCTScreenScale());
  [view.layer renderInContext:ctx];
  CGContextRelease(ctx);
  return [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
}

@implementation GLTexture
{
  GLuint _handle; // The identifier of the gl texture
  GLImageData* dataCurrentlyUploaded; // The last set data (cache)
}

GLImageData *EMPTY_PIXELS;

- (instancetype)init
{
  if (!EMPTY_PIXELS) {
    EMPTY_PIXELS = genPixelsEmpty(2, 2);
  }
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
  if (data != dataCurrentlyUploaded) {
    dataCurrentlyUploaded = data;
    [self bind];
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, data.width, data.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data.data);
  }
}

- (void)setPixelsEmpty
{
  [self setPixels:EMPTY_PIXELS];
}

- (void)setPixelsRandom: (int)width withHeight:(int)height // for testing
{
  GLImageData* data = genPixelsRandom(width, height);
  [self setPixels:data];
}

- (void)setPixelsWithImage: (UIImage *)image
{
  GLImageData *data = genPixelsWithImage(image);
  if (!data) return;
  [self setPixels:data];
}

- (void)setPixelsWithView: (UIView *)view
{
  GLImageData *data = genPixelsWithView(view);
  [self setPixels:data];
}


@end


#import <React/RCTLog.h>
#import "GLImageData.h"

// This structure aims to be used in an immutable way
@implementation GLImageData
{
  GLubyte *_data;
  int _width;
  int _height;
}

GLImageData *EMPTY_PIXELS;

+ (GLImageData *)empty
{
  if (!EMPTY_PIXELS) {
    int width = 2, height = 2;
    GLubyte* data = (GLubyte *) malloc(width*height*4*sizeof(GLubyte));
    for (int i = 0; i < width * height * 4; i+=4) {
      data[i] = data[i+1] = data[i+2] = 0;
      data[i+3] = 0;
    }
    EMPTY_PIXELS = [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
  }
  return EMPTY_PIXELS;
}

+ (GLImageData *)genPixelsWithImage: (UIImage *)image
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

+ (GLImageData *)genPixelsWithView: (UIView *)view withPixelRatio:(float)pixelRatio
{
  float width = pixelRatio * view.bounds.size.width;
  float height = pixelRatio * view.bounds.size.height;
  GLubyte *data = (GLubyte *)malloc(4 * width * height);
  CGColorSpaceRef colourSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(data, width, height, 8, 4 * width, colourSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(colourSpace);
  CGContextClearRect(ctx, CGRectMake(0.0, 0.0, width, height));
  CGContextScaleCTM(ctx, pixelRatio, pixelRatio);
  [view.layer renderInContext:ctx];
  CGContextRelease(ctx);
  return [[GLImageData alloc] initWithData:data withWidth:width withHeight:height];
}

- (instancetype)initWithData: (GLubyte *)data withWidth:(int)width withHeight:(int)height
{
  self = [super init];
  if (self) {
    _data = data;
    _width = width;
    _height = height;
  }
  return self;
}

- (void)dealloc
{
  if (_data) {
    free(_data);
    _data = nil;
    _width = 0;
    _height = 0;
  }
}

@end

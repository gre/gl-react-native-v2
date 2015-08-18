
#import "GLUtils.h"
#import "RCTLog.h"

GLuint compileShader (NSString* shaderName, NSString* shaderString, GLenum shaderType) {
  
  GLuint shaderHandle = glCreateShader(shaderType);
  
  const char * shaderStringUTF8 = [shaderString UTF8String];
  int shaderStringLength = (int) [shaderString length];
  glShaderSource(shaderHandle, 1, &shaderStringUTF8, &shaderStringLength);
  
  glCompileShader(shaderHandle);
  
  GLint compileSuccess;
  glGetShaderiv(shaderHandle, GL_COMPILE_STATUS, &compileSuccess);
  if (compileSuccess == GL_FALSE) {
    GLchar messages[256];
    glGetShaderInfoLog(shaderHandle, sizeof(messages), 0, &messages[0]);
    NSString *messageString = [NSString stringWithUTF8String:messages];
    RCTLogError(@"Shader '%@' failed to compile: %@", shaderName, messageString);
    return -1;
  }
  
  return shaderHandle;
}



ImageData* genPixelsEmpty (int width, int height)
{
  GLubyte* data = (GLubyte *) malloc(width*height*4*sizeof(GLubyte));
  for (int i = 0; i < width * height * 4; i+=4) {
    data[i] = data[i+1] = data[i+2] = 0;
    data[i+3] = 0;
  }
  return [[ImageData alloc] initWithData:data withWidth:width withHeight:height];
}

ImageData* genPixelsRandom (int width, int height)
{
  GLubyte* data = (GLubyte *) malloc(width*height*4*sizeof(GLubyte));
  for (int i = 0; i < width * height * 4; i+=4) {
    data[i] = rand() % 255;
    data[i+1] = rand() % 255;
    data[i+2] = rand() % 255;
    data[i+3] = 255;
  }
  return [[ImageData alloc] initWithData:data withWidth:width withHeight:height];
}

ImageData* genPixelsWithImage (UIImage *image)
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
  return [[ImageData alloc] initWithData:data withWidth:width withHeight:height];
}

ImageData* genPixelsWithView (UIView *view)
{
  int width = view.bounds.size.width;
  int height = view.bounds.size.height;
  GLubyte *data = (GLubyte *)malloc(4 * width * height);
  CGColorSpaceRef colourSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef ctx = CGBitmapContextCreate(data, width, height, 8, 4 * width, colourSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(colourSpace);
  CGContextClearRect(ctx, view.bounds);
  [view.layer renderInContext:ctx];
  CGContextRelease(ctx);
  return [[ImageData alloc] initWithData:data withWidth:width withHeight:height];
}
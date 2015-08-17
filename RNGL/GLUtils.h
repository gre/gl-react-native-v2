#import <GLKit/GLKit.h>
#import "ImageData.h"

GLuint compileShader (NSString* shaderString, GLenum shaderType);

ImageData* genPixelsEmpty (int width, int height);
ImageData* genPixelsRandom (int width, int height);
ImageData* genPixelsWithImage (UIImage *image);
ImageData* genPixelsWithView (UIView *view);
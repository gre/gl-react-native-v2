#import <GLKit/GLKit.h>
#import "RCTBridge.h"
#import "GLImageData.h"

GLImageData* genPixelsWithImage (UIImage *image);

@interface GLTexture: NSObject

@property EAGLContext *context;
@property GLuint handle;

- (instancetype)init;
- (int)bind: (int)unit;
- (void)bind;

- (void)setShapeWithWidth:(float)width withHeight:(float)height;

- (void)setPixels: (GLImageData *)data;
- (void)setPixelsEmpty;
- (void)setPixelsRandom: (int)width withHeight:(int)height;
- (void)setPixelsWithImage: (UIImage *)image;
- (void)setPixelsWithView: (UIView *)view;

@end

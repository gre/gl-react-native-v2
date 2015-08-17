#import <GLKit/GLKit.h>
#import "RCTBridge.h"
#import "ImageData.h"

@interface GLTexture: NSObject

@property EAGLContext *context;

- (instancetype)init;
- (int)bind: (int)unit;

- (void)setPixels: (ImageData *)data;
- (void)setPixelsEmpty;
- (void)setPixelsRandom: (int)width withHeight:(int)height;
- (void)setPixelsWithImage: (UIImage *)image;
- (void)setPixelsWithView: (UIView *)view;

@end

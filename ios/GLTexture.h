#import <GLKit/GLKit.h>
#import <React/RCTBridge.h>
#import "GLImageData.h"

@interface GLTexture: NSObject

@property EAGLContext *context;
@property GLuint handle;

- (instancetype)init;
- (int)bind: (int)unit;
- (void)bind;

- (void)setShapeWithWidth:(float)width withHeight:(float)height;

- (void)setPixels: (GLImageData *)data;

@end

#import <GLKit/GLKit.h>

@interface GLFBO: NSObject

@property (nonatomic) EAGLContext *context;

// This contains the framebuffer GLTexture instances
@property (nonatomic) NSArray *color;

- (instancetype)init;

- (void)bind;

- (void)setShapeWithWidth:(float)width withHeight:(float)height;

@end

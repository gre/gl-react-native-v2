#import <GLKit/GLKit.h>

@interface GLView : GLKView

@property (nonatomic) NSNumber *shader;
@property (nonatomic) NSDictionary *uniforms;
@property (nonatomic) NSArray *targetUniforms;
@property (nonatomic) BOOL opaque;
@property (nonatomic) NSNumber *targetIncrement;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

@end

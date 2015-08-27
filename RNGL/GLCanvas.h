#import <GLKit/GLKit.h>
#import "GLData.h"

@interface GLCanvas: GLKView

@property (nonatomic) GLData *data;
@property (nonatomic) BOOL opaque;
@property (nonatomic) NSNumber *nbTargets;

- (instancetype)initWithBridge:(RCTBridge *)bridge
                   withContext:(EAGLContext*)context;

@end

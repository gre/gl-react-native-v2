#import <GLKit/GLKit.h>
#import "GLData.h"

@interface GLCanvas: GLKView

@property (nonatomic) GLData *data;
@property (nonatomic) BOOL opaque;
@property (nonatomic) NSNumber *nbContentTextures;
@property (nonatomic) NSNumber *renderId;
@property (nonatomic) NSArray *imagesToPreload;

- (instancetype)initWithBridge:(RCTBridge *)bridge
                   withContext:(EAGLContext*)context;

@end

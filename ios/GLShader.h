#import <GLKit/GLKit.h>
#import <React/RCTBridgeModule.h>

NS_ENUM(NSInteger) {
    GLContextFailure = 87001,
    GLLinkingFailure = 87002,
    GLCompileFailure = 87003,
    GLNotAProgram    = 87004
};

@interface GLShader: NSObject

@property NSString *name;
@property EAGLContext *context;
@property NSString *vert;
@property NSString *frag;
@property NSArray *uniformNames;
@property NSDictionary *uniformTypes;

/**
 * Create a new shader with a vertex and fragment
 */
- (instancetype)initWithContext: (EAGLContext*)context withName:(NSString *)name withVert:(NSString *)vert withFrag:(NSString *)frag;

/**
 * Bind the shader program as the current one
 */
- (void) bind;

- (bool) ensureCompiles: (NSError**)error;

/**
 * Set the value of an uniform
 */
- (void) setUniform: (NSString *)name withValue:(id)obj;

@end

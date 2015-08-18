#import <GLKit/GLKit.h>
#import "RCTBridgeModule.h"

@interface GLShader: NSObject

@property EAGLContext *context;
@property NSString *vert;
@property NSString *frag;
@property NSDictionary *uniformTypes;

/**
 * Create a new shader with a vertex and fragment
 */
- (instancetype)initWithContext: (EAGLContext*)context withName:(NSString *)name withVert:(NSString *)vert withFrag:(NSString *)frag;

/**
 * Bind the shader program as the current one
 */
- (void) bind;

/**
 * Check the shader validity
 */
- (void) validate;

/**
 * Set the value of an uniform
 */
- (void) setUniform: (NSString *)name withValue:(id)obj;

@end

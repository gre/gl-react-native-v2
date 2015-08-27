#import <UIKit/UIKit.h>
#import "RCTBridgeModule.h"
#import "GLShader.h"
#import "GLFBO.h"


@interface GLShadersRegistry : NSObject <RCTBridgeModule>

/**
 * Get the global shader for a given id.
 */
+ (GLShader*) getShader: (NSNumber *)id;

+ (GLFBO*) getFBO: (NSNumber *)id;

+ (EAGLContext *) getContext;

@property NSMutableDictionary *shaders;
@end

#import <UIKit/UIKit.h>
#import "RCTBridgeModule.h"
#import "GLShader.h"


@interface GLShadersRegistry : NSObject <RCTBridgeModule>

/**
 * Get the global shader for a given id.
 */
+ (GLShader*) getShader: (NSNumber *)ctxid;

@property NSMutableDictionary *shaders;
@end

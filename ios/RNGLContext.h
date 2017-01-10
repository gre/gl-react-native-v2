#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import "GLShader.h"
#import "GLFBO.h"

@interface RNGLContext : NSObject <RCTBridgeModule>

- (GLShader*) getShader: (NSNumber *)id;

- (GLFBO*) getFBO: (NSNumber *)id;

- (EAGLContext *) getContext;

@end


@interface RCTBridge (RNGLContext)

@property (nonatomic, readonly) RNGLContext *rnglContext;

@end

#import <UIKit/UIKit.h>

#import "RCTBridgeModule.h"
#import "RCTConvert.h"
#import "RCTLog.h"
#import "GLShadersRegistry.h"


@implementation GLShadersRegistry
{
  NSMutableDictionary *_shaders;
  EAGLContext *_context;
}

GLShadersRegistry *GLShadersRegistry_instance; // FIXME is that the proper way to do singleton?

RCT_EXPORT_MODULE();

+ (GLShader*) getShader: (NSNumber *)ctxid
{
  return [GLShadersRegistry_instance shaders][ctxid];
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES2];
    if (!_context) {
      RCTLogError(@"Failed to initialize OpenGLES 2.0 context");
    }
    _shaders = @{}.mutableCopy;
    GLShadersRegistry_instance = self;
  }
  return self;
}

static NSString* fullViewportVert = @"attribute vec2 position;varying vec2 uv;void main() {gl_Position = vec4(position,0.0,1.0);uv = vec2(0.5, 0.5) * (position+vec2(1.0, 1.0));}";

RCT_EXPORT_METHOD(register:(nonnull NSNumber *)id withConfig:(NSDictionary *)config) {
  NSString *frag = [RCTConvert NSString:config[@"frag"]];
  GLShader *shader = [[GLShader alloc] initWithContext:_context withVert:fullViewportVert withFrag:frag];
  _shaders[id] = shader;
}

@end

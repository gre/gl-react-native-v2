
#import "RNGLContext.h"
#import "RCTConvert.h"
#import "RCTLog.h"


@implementation RNGLContext
{
  NSMutableDictionary *_shaders;
  EAGLContext *_context;
  NSMutableDictionary *_fbos;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

- (void)setBridge:(RCTBridge *)bridge
{
  _context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES2];
  if (!_context) {
    RCTLogError(@"Failed to initialize OpenGLES 2.0 context");
  }
  _shaders = @{}.mutableCopy;
  _fbos = @{}.mutableCopy;
}

- (GLShader *) getShader: (NSNumber *)id
{
  return _shaders[id];
}

- (GLFBO *) getFBO: (NSNumber *)id
{
  GLFBO *fbo = _fbos[id];
  if (!fbo) {
    fbo = [[GLFBO alloc] init];
    _fbos[id] = fbo;
  }
  return fbo;
}

- (EAGLContext *) getContext
{
  return _context;
}

static NSString* fullViewportVert = @"attribute vec2 position;varying vec2 uv;void main() {gl_Position = vec4(position,0.0,1.0);uv = vec2(0.5, 0.5) * (position+vec2(1.0, 1.0));}";

RCT_EXPORT_METHOD(addShader:(nonnull NSNumber *)id withConfig:(NSDictionary *)config) {
  NSString *frag = [RCTConvert NSString:config[@"frag"]];
  NSString *name = [RCTConvert NSString:config[@"name"]];
  if (!frag) {
    RCTLogError(@"Shader '%@': missing frag field", name);
    return;
  }
  GLShader *shader = [[GLShader alloc] initWithContext:_context withName:name withVert:fullViewportVert withFrag:frag];
  _shaders[id] = shader;
}

@end

@implementation RCTBridge (RNGLContext)

- (RNGLContext *)rnglContext
{
  return self.modules[RCTBridgeModuleNameForClass([RNGLContext class])];
}

@end
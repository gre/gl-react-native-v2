#import "GLData.h"

@implementation GLData

-(instancetype)initWithShader: (NSNumber *)shader
                 withUniforms: (NSDictionary *)uniforms
                    withWidth: (NSNumber *)width
                   withHeight: (NSNumber *)height
                    withFboId: (NSNumber *)fboId
          withContextChildren: (NSArray *)contextChildren
                 withChildren: (NSArray *)children
       withPremultipliedAlpha: (BOOL)premultipliedAlpha
{
  if ((self = [super init])) {
    self.shader = shader;
    self.uniforms = uniforms;
    self.width = width;
    self.height = height;
    self.fboId = fboId;
    self.contextChildren = contextChildren;
    self.children = children;
    self.premultipliedAlpha = premultipliedAlpha;
  }
  return self;
}

@end

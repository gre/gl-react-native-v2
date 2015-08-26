#import "GLData.h"

@implementation GLData

-(instancetype)initWithShader: (NSNumber *)shader
                 withUniforms: (NSDictionary *)uniforms
                    withWidth: (NSNumber *)width
                   withHeight: (NSNumber *)height
                 withChildren: (NSArray *)children
{
  if ((self = [super init])) {
    self.shader = shader;
    self.uniforms = uniforms;
    self.width = width;
    self.height = height;
    self.children = children;
  }
  return self;
}

@end

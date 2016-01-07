#include "GLRenderData.h"

@implementation GLRenderData


-(instancetype) initWithShader: (GLShader *)shader
                  withUniforms:(NSDictionary *)uniforms
                  withTextures: (NSDictionary *)textures
                     withWidth: (int)width
                    withHeight: (int)height
                     withFboId: (int)fboId
           withContextChildren: (NSArray *)contextChildren
                  withChildren: (NSArray *)children
{
  
  if ((self = [super init])) {
    self.shader = shader;
    self.uniforms = uniforms;
    self.textures = textures;
    self.width = width;
    self.height = height;
    self.fboId = fboId;
    self.contextChildren = contextChildren;
    self.children = children;
  }
  return self;
}

@end
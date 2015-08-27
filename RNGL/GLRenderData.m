#include "GLRenderData.h"

@implementation GLRenderData


-(instancetype) initWithShader: (GLShader *)shader
                  withUniforms:(NSDictionary *)uniforms
                  withTextures: (NSDictionary *)textures
                     withWidth: (NSNumber *)width
                    withHeight: (NSNumber *)height
                withFrameIndex: (int)frameIndex
                  withChildren: (NSArray *)children
{
  
  if ((self = [super init])) {
    self.shader = shader;
    self.uniforms = uniforms;
    self.textures = textures;
    self.width = width;
    self.height = height;
    self.frameIndex = frameIndex;
    self.children = children;
  }
  return self;
}

@end
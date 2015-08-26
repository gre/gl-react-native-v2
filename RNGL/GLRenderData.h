#import "GLShader.h"

@interface GLRenderData : NSObject

@property (nonatomic) GLShader *shader;
@property (nonatomic) NSDictionary *uniforms;
@property (nonatomic) NSDictionary *textures;
@property (nonatomic) NSNumber *width;
@property (nonatomic) NSNumber *height;
@property (nonatomic) int frameIndex;
@property (nonatomic) NSArray *children;

-(instancetype) initWithShader: (GLShader *)shader
                  withUniforms:(NSDictionary *)uniforms
                  withTextures: (NSDictionary *)textures
                     withWidth: (NSNumber *)width
                    withHeight: (NSNumber *)height
                withFrameIndex: (int)frameIndex
                  withChildren: (NSArray *)children;

@end

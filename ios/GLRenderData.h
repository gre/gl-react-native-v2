#import "GLShader.h"

// GLRenderData is the validated/gl'resolved version of GLData

@interface GLRenderData : NSObject

@property (nonatomic) GLShader *shader;
@property (nonatomic) NSDictionary *uniforms;
@property (nonatomic) NSDictionary *textures;
@property (nonatomic) NSNumber *width;
@property (nonatomic) NSNumber *height;
@property (nonatomic) int fboId;
@property (nonatomic) NSArray *contextChildren;
@property (nonatomic) NSArray *children;

-(instancetype) initWithShader: (GLShader *)shader
                  withUniforms:(NSDictionary *)uniforms
                  withTextures: (NSDictionary *)textures
                     withWidth: (NSNumber *)width
                    withHeight: (NSNumber *)height
                     withFboId: (int)fboId
           withContextChildren: (NSArray *)contextChildren
                  withChildren: (NSArray *)children;

@end

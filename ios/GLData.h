#import <Foundation/Foundation.h>

// Data format of gl-react

@interface GLData: NSObject

@property (nonatomic) NSNumber *shader;
@property (nonatomic) NSDictionary *uniforms;
@property (nonatomic) NSNumber *width;
@property (nonatomic) NSNumber *height;
@property (nonatomic) NSNumber *pixelRatio;
@property (nonatomic) NSNumber *fboId;
@property (nonatomic) NSArray *contextChildren;
@property (nonatomic) NSArray *children;

-(instancetype)initWithShader: (NSNumber *)shader
                 withUniforms: (NSDictionary *)uniforms
                    withWidth: (NSNumber *)width
                   withHeight: (NSNumber *)height
               withPixelRatio: (NSNumber *)pixelRatio
                    withFboId: (NSNumber *)fboId
          withContextChildren: (NSArray *)contextChildren
                 withChildren: (NSArray *)children;

@end

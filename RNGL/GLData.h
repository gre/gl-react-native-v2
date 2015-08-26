#import <Foundation/Foundation.h>

@interface GLData: NSObject

@property (nonatomic) NSNumber *shader;
@property (nonatomic) NSDictionary *uniforms;
@property (nonatomic) NSNumber *width;
@property (nonatomic) NSNumber *height;
@property (nonatomic) NSArray *children;

-(instancetype)initWithShader: (NSNumber *)shader
                 withUniforms: (NSDictionary *)uniforms
                    withWidth: (NSNumber *)width
                   withHeight: (NSNumber *)height
                 withChildren: (NSArray *)children;

@end

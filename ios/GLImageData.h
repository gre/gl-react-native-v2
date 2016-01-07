#import <GLKit/GLKit.h>

@interface GLImageData: NSObject

@property (nonatomic) GLubyte *data;
@property (nonatomic) int width;
@property (nonatomic) int height;

+ (GLImageData*) empty;
+ (GLImageData*) genPixelsWithImage: (UIImage *)image;
+ (GLImageData*) genPixelsWithView: (UIView *)view withPixelRatio:(float)pixelRatio;

- (instancetype)initWithData: (GLubyte *)data withWidth:(int)width withHeight:(int)height;

@end


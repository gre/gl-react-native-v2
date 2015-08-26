#import <GLKit/GLKit.h>

@interface GLImageData: NSObject

@property (nonatomic) GLubyte *data;
@property (nonatomic) int width;
@property (nonatomic) int height;

- (instancetype)initWithData: (GLubyte *)data withWidth:(int)width withHeight:(int)height;

@end

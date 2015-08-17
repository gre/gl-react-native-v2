
#import "RCTBridge.h"
#import "ImageData.h"

@interface GLReactImage: NSObject

@property (nonatomic, copy) NSString *src;
@property (nonatomic) UIImage *image;


- (instancetype)initWithBridge:(RCTBridge *)bridge withOnLoad:(void (^)(void))onload NS_DESIGNATED_INITIALIZER;

- (ImageData *) getImageData;

@end

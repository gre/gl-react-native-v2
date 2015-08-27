
#import "RCTBridge.h"
#import "GLTexture.h"

@interface GLImage: NSObject

@property (nonatomic, copy) NSString *src;
@property (nonatomic) UIImage *image;


- (instancetype)initWithBridge:(RCTBridge *)bridge withOnLoad:(void (^)(void))onload NS_DESIGNATED_INITIALIZER;

- (GLTexture *) getTexture;

@end

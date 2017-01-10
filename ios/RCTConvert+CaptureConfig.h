#import <React/RCTConvert.h>
#import "CaptureConfig.h"

@interface RCTConvert (CaptureConfig)

+ (CaptureConfig *)CaptureConfig:(id)json;

@end

#import "CaptureConfig.h"

@implementation CaptureConfig

-(instancetype)initWithFormat: (NSString *)format
                     withType: (NSString *)type
                  withQuality: (NSNumber *)quality
                 withFilePath: (NSString *)filePath
{
  if ((self = [super init])) {
    self.format = format;
    self.type = type;
    self.quality = quality;
    self.filePath = filePath;
  }
  return self;
}


- (bool) isEqualToCaptureConfig: (CaptureConfig *)other
{
  return [self.format isEqualToString:other.format] &&
  [self.type isEqualToString:other.type] &&
  [self.quality isEqualToNumber:other.quality] &&
  [self.filePath isEqualToString:other.filePath];
}

- (NSDictionary *) dictionary
{
  return @{
           @"format": self.format,
           @"type": self.type,
           @"quality": self.quality,
           @"filePath": self.filePath
           };
}

@end

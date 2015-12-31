#import <Foundation/Foundation.h>

@interface CaptureConfig: NSObject

@property (nonatomic, copy) NSString *format;
@property (nonatomic, copy) NSString *type;
@property (nonatomic, copy) NSString *filePath;
@property (nonatomic, copy) NSNumber *quality;

-(instancetype)initWithFormat: (NSString *)format
                     withType: (NSString *)type
                  withQuality: (NSNumber *)quality
                 withFilePath: (NSString *)filePath;

- (bool) isEqualToCaptureConfig: (CaptureConfig *)other;

- (NSDictionary *) dictionary;

@end

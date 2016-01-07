//
//  RCTConvert+CaptureConfig.m
//  RNGL
//
//  Created by Gaetan Renaudeau on 30/12/15.
//
//

#import "RCTConvert+CaptureConfig.h"

@implementation RCTConvert (CaptureConfig)

+ (CaptureConfig *)CaptureConfig:(id)json
{
  return [[CaptureConfig alloc]
          initWithFormat:[RCTConvert NSString:json[@"format"]]
          withType:[RCTConvert NSString:json[@"type"]]
          withQuality:[RCTConvert NSNumber:json[@"quality"]]
          withFilePath:[RCTConvert NSString:json[@"filePath"]]];
}

@end

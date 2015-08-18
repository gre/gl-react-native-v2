#import "GLViewManager.h"
#import "GLView.h"
#import "RCTLog.h"
#import <UIKit/UIKit.h>

@implementation GLViewManager

RCT_EXPORT_MODULE();

- (instancetype)init
{
  self = [super init];
  if (self) {
  }
  return self;
}

RCT_EXPORT_VIEW_PROPERTY(uniforms, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(shader, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(targetUniforms, NSArray);
RCT_EXPORT_VIEW_PROPERTY(opaque, BOOL);
RCT_EXPORT_VIEW_PROPERTY(targetIncrement, NSNumber);

- (UIView *)view
{
  GLView * v;
  v = [[GLView alloc] initWithBridge:self.bridge];
  return v;
  
}

@end
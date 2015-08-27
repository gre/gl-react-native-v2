#import "GLCanvasManager.h"
#import "GLCanvas.h"
#import "RCTConvert+GLData.h"
#import "RCTLog.h"
#import <UIKit/UIKit.h>

#import "GLShadersRegistry.h"

@implementation GLCanvasManager

RCT_EXPORT_MODULE();

- (instancetype)init
{
  self = [super init];
  if (self) {
  }
  return self;
}

RCT_EXPORT_VIEW_PROPERTY(nbTargets, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(opaque, BOOL);
RCT_EXPORT_VIEW_PROPERTY(data, GLData);
RCT_EXPORT_VIEW_PROPERTY(renderId, NSNumber);

- (UIView *)view
{
  GLCanvas * v;
  v = [[GLCanvas alloc] initWithBridge:self.bridge withContext:[GLShadersRegistry getContext]];
  return v;
  
}

@end
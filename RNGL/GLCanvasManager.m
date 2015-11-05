#import "GLCanvasManager.h"
#import "GLCanvas.h"
#import "RCTConvert+GLData.h"
#import "RCTLog.h"
#import <UIKit/UIKit.h>

@implementation GLCanvasManager

RCT_EXPORT_MODULE();

- (instancetype)init
{
  self = [super init];
  if (self) {
  }
  return self;
}

RCT_EXPORT_VIEW_PROPERTY(nbContentTextures, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(opaque, BOOL);
RCT_EXPORT_VIEW_PROPERTY(autoRedraw, BOOL);
RCT_EXPORT_VIEW_PROPERTY(eventsThrough, BOOL);
RCT_EXPORT_VIEW_PROPERTY(visibleContent, BOOL);
RCT_EXPORT_VIEW_PROPERTY(captureNextFrameId, int);
RCT_EXPORT_VIEW_PROPERTY(data, GLData);
RCT_EXPORT_VIEW_PROPERTY(renderId, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(imagesToPreload, NSArray);
RCT_EXPORT_VIEW_PROPERTY(onLoad, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onProgress, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onChange, BOOL);

- (UIView *)view
{
  GLCanvas * v;
  v = [[GLCanvas alloc] initWithBridge:self.bridge];
  return v;
  
}

@end
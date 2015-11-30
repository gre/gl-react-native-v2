#import "GLCanvasManager.h"
#import "GLCanvas.h"
#import "RCTConvert+GLData.h"
#import "RCTSparseArray.h"
#import "RCTUIManager.h"
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
RCT_EXPORT_VIEW_PROPERTY(data, GLData);
RCT_EXPORT_VIEW_PROPERTY(renderId, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(imagesToPreload, NSArray);
RCT_EXPORT_VIEW_PROPERTY(onLoad, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onProgress, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onChange, BOOL);

RCT_EXPORT_METHOD(capture: (nonnull NSNumber *)reactTag callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    GLCanvas *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[GLCanvas class]]) {
      RCTLog(@"expecting UIView, got: %@", view);
      callback(@[@"view is not a GLCanvas"]);
    }
    else {
      [view capture:callback];
    }
  }];
}

- (UIView *)view
{
  GLCanvas * v;
  v = [[GLCanvas alloc] initWithBridge:self.bridge];
  return v;
  
}

@end
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>
#import <UIKit/UIKit.h>
#import "GLCanvasManager.h"
#import "GLCanvas.h"
#import "RCTConvert+GLData.h"
#import "RCTConvert+CaptureConfig.h"

@implementation GLCanvasManager

RCT_EXPORT_MODULE();

- (instancetype)init
{
  self = [super init];
  if (self) {
  }
  return self;
}

- (dispatch_queue_t)methodQueue
{
  return self.bridge.uiManager.methodQueue;
}

RCT_EXPORT_VIEW_PROPERTY(nbContentTextures, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(autoRedraw, BOOL);
RCT_EXPORT_VIEW_PROPERTY(preserveImages, BOOL);
RCT_EXPORT_VIEW_PROPERTY(data, GLData);
RCT_EXPORT_VIEW_PROPERTY(renderId, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(pixelRatio, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(imagesToPreload, NSArray);
RCT_EXPORT_VIEW_PROPERTY(onGLLoad, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onGLProgress, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onGLCaptureFrame, RCTBubblingEventBlock);

RCT_EXPORT_METHOD(capture: (nonnull NSNumber *)reactTag withConfig:(id)config)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    UIView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[GLCanvas class]]) {
      RCTLog(@"expecting UIView, got: %@", view);
    }
    else {
      GLCanvas *glCanvas = (GLCanvas *)view;
      [glCanvas requestCaptureFrame:[RCTConvert CaptureConfig:config]];
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

#import <GLKit/GLKit.h>
#import "GLData.h"
#import "CaptureConfig.h"
#import "RCTComponent.h"

@interface GLCanvas: GLKView

@property (nonatomic) GLData *data;
@property (nonatomic) BOOL autoRedraw;
@property (nonatomic) BOOL eventsThrough;
@property (nonatomic) BOOL visibleContent;
@property (nonatomic) NSNumber *nbContentTextures;
@property (nonatomic) NSNumber *renderId;
@property (nonatomic) NSNumber *pixelRatio;
@property (nonatomic) NSArray *imagesToPreload;
@property (nonatomic, copy) RCTBubblingEventBlock onGLProgress;
@property (nonatomic, copy) RCTBubblingEventBlock onGLLoad;
@property (nonatomic, copy) RCTBubblingEventBlock onGLCaptureFrame;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

- (void) requestCaptureFrame:(CaptureConfig *)config;

@end

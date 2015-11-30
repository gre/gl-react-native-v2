#import <GLKit/GLKit.h>
#import "GLData.h"

@interface GLCanvas: GLKView

@property (nonatomic) GLData *data;
@property (nonatomic) BOOL opaque;
@property (nonatomic) BOOL autoRedraw;
@property (nonatomic) BOOL eventsThrough;
@property (nonatomic) BOOL visibleContent;
@property (nonatomic) NSNumber *nbContentTextures;
@property (nonatomic) NSNumber *renderId;
@property (nonatomic) NSArray *imagesToPreload;
@property (nonatomic, assign) BOOL onProgress;
@property (nonatomic, assign) BOOL onLoad;
@property (nonatomic, assign) BOOL onChange;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

- (void) capture:(RCTResponseSenderBlock)callback;

@end

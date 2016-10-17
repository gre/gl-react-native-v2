
#import "GLImage.h"
#import "GLImageData.h"
#import "RCTBridge.h"
#import "RCTImageLoader.h"
#import "RCTLog.h"
#import "GLTexture.h"
#import "RCTUtils.h"

@implementation GLImage
{
  RCTBridge *_bridge; // React's bridge allow to access the imageLoader
  UIImage *_image; // The currently loaded image (nil if no image fully loaded yet)
  GLImageData *_data; // Cache of the data related to this image (computed by getImageData)
  GLTexture *_texture; // Cache of the texture
  void (^_onload)(void); // called everytime an image loads
  RCTImageLoaderCancellationBlock _loading; // the current loading cancellation function
}

- (instancetype)initWithBridge:(RCTBridge *)bridge withOnLoad:(void (^)(void))onload
{
  if ((self = [super init])) {
    _bridge = bridge;
    _onload = onload;
    _image = nil;
    _loading = nil;
    _texture = [[GLTexture alloc] init];
  }
  return self;
}

- (void)dealloc
{
  [self clearImage];
  if (_loading) _loading();
  _onload = nil;
  _loading = nil;
  _bridge = nil;
  _texture = nil;
}

RCT_NOT_IMPLEMENTED(-init)

- (void) clearImage
{
  _image = nil;
  _data = nil;
}

- (GLTexture *) getTexture
{
  if (_image) {
    if (!_data) {
        _data = [GLImageData genPixelsWithImage:_image];
    }
    [_texture setPixels:_data];
  }
  else {
      [_texture setPixels:nil];
  }
  return _texture;
}

- (void)setSource:(RCTImageSource *)source
{
  if (![source isEqual:_source]) {
    _source = source;
    [self reloadImage];
  }
}

- (void)reloadImage
{
  RCTImageSource *source = _source;
  if (_loading) _loading();
  _loading = nil;
  if (!source) {
    [self clearImage];
  }
  else {
    // Load the image (without resizing it)
    __weak GLImage *weakSelf = self;
    _loading = [_bridge.imageLoader loadImageWithURLRequest:source.request
                                       size:CGSizeZero
                                      scale:0
                                      clipped:YES
                                 resizeMode:RCTResizeModeStretch
                              progressBlock:nil
                              partialLoadBlock:nil
                            completionBlock:^(NSError *error, UIImage *loadedImage) {
                              GLImage *strongSelf = weakSelf;
                              void (^setImageBlock)(UIImage *) = ^(UIImage *image) {
                                if (![source isEqual:strongSelf.source]) {
                                  // Bail out if source has changed since we started loading
                                  return;
                                }
                                strongSelf.image = [UIImage imageWithCGImage:image.CGImage];
                                dispatch_async(dispatch_get_main_queue(), ^{
                                  if (_onload) _onload();
                                });
                              };

                              _loading = nil;
                              [self clearImage];
                              if (error) {
                                NSLog(@"Image failed to load: %@", error);
                              } else {
                                if ([NSThread isMainThread]) {
                                  setImageBlock(loadedImage);
                                } else {
                                  RCTExecuteOnMainThread(^{
                                    setImageBlock(loadedImage);
                                  }, NO);
                                }
                              }
                            }];
  }
}


@end

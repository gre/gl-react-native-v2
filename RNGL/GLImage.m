
#import "GLImage.h"
#import "GLImageData.h"
#import "RCTBridge.h"
#import "RCTImageLoader.h"
#import "RCTLog.h"
#import "GLTexture.h"

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
      _data = genPixelsWithImage(_image);
    }
    [_texture setPixels:_data];
  }
  else {
    [_texture setPixelsEmpty];
  }
  return _texture;
}

- (void)setSrc:(NSString *)src
{
  if (![src isEqualToString:_src]) {
    _src = [src copy];
    [self reloadImage];
  }
}

- (void)reloadImage
{
  if (_loading) _loading();
  _loading = nil;
  if (!_src) {
    [self clearImage];
  } else {
    
    // Load the image (without resizing it)
    
    if (![_src hasPrefix:@"http://"] && ![_src hasPrefix:@"https://"]) {
      // N.B: in this case we don't trigger onload because image is already loaded.
      // this behavior is specific to GLCanvas needs
      self.image = [UIImage imageNamed:_src];
    } else {
      _loading = [_bridge.imageLoader loadImageWithTag:_src
                                       size:CGSizeZero
                                      scale:0
                                 resizeMode:UIViewContentModeScaleToFill
                              progressBlock:nil
                            completionBlock:^(NSError *error, id image) {
                              _loading = nil;
                              [self clearImage];
                              if (error) {
                                NSLog(@"Image failed to load: %@", error);
                              } else {
                                self.image = image;
                                if(_onload) _onload();
                              }
                            }];
    }
  }
}


@end

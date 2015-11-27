
#import "GLImageData.h"

// TODO: rename to GLImageData

// This structure aims to be used in an immutable way
@implementation GLImageData
{
  GLubyte *_data;
  int _width;
  int _height;
}

- (instancetype)initWithData: (GLubyte *)data withWidth:(int)width withHeight:(int)height
{
  self = [super init];
  if (self) {
    _data = data;
    _width = width;
    _height = height;
  }
  return self;
}

- (void)dealloc
{
  if (_data) {
    free(_data);
    _data = nil;
    _width = 0;
    _height = 0;
  }
}

@end

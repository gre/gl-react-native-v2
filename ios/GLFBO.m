#import "GLFBO.h"
#import "GLTexture.h"
#import <React/RCTLog.h>

@interface FBOState: NSObject

@property (nonatomic) GLint fbo;
@property (nonatomic) GLint rbo;
@property (nonatomic) GLint tex;

- (instancetype)initFromContext;
- (void)restore;

@end

@implementation FBOState

- (instancetype)initFromContext
{
  if ((self = [super init])) {
    GLint fbo, rbo, tex;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &fbo);
    glGetIntegerv(GL_RENDERBUFFER_BINDING, &rbo);
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &tex);
    self.fbo = fbo;
    self.rbo = rbo;
    self.tex = tex;
  }
  return self;
}

- (void)restore
{
  glBindFramebuffer(GL_FRAMEBUFFER, _fbo);
  glBindRenderbuffer(GL_RENDERBUFFER, _rbo);
  glBindTexture(GL_TEXTURE_2D, _tex);
}

@end

GLTexture *initTexture (float width, float height, GLuint attachment)
{
  GLTexture *texture = [[GLTexture alloc] init];
  [texture bind];
  [texture setShapeWithWidth:width withHeight:height];
  glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, texture.handle, 0);
  return texture;
}

@implementation GLFBO
{
  GLuint _handle;
  float _width;
  float _height;
  NSArray *_color;
}

-(void)dealloc
{
  glDeleteFramebuffers(1, &_handle);
}

-(instancetype)init
{
  if ((self = [super init])) {
    _color = [[NSArray alloc] init];
    FBOState *state = [[FBOState alloc] initFromContext];
    
    glGenFramebuffers(1, &_handle);
    
    int numColors = 1;
    
    glBindFramebuffer(GL_FRAMEBUFFER, _handle);
    
    NSMutableArray *color = [[NSMutableArray alloc] init];
    for(int i=0; i<numColors; ++i) {
      color[i] = initTexture(_width, _height, GL_COLOR_ATTACHMENT0 + i);
    }
    _color = color;
    
    [state restore];
  }
  return self;
}

- (void)checkStatus
{
  GLuint status = glCheckFramebufferStatus(GL_FRAMEBUFFER);
  if(status != GL_FRAMEBUFFER_COMPLETE) {
    switch (status) {
      case GL_FRAMEBUFFER_UNSUPPORTED:
        RCTLogError(@"Framebuffer unsupported");
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        RCTLogError(@"Framebuffer incomplete attachment");
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        RCTLogError(@"Framebuffer incomplete dimensions");
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        RCTLogError(@"Framebuffer incomplete missing attachment");
        break;
      default:
        RCTLogError(@"Failed to create framebuffer: %i", status);
    }
  }
}

- (void)bind
{
  glBindFramebuffer(GL_FRAMEBUFFER, _handle);
  glViewport(0, 0, _width, _height);
}

- (void)setShapeWithWidth:(float)width withHeight:(float)height
{
  if (width == _width && height == _height) return;
  GLint maxFBOSize;
  glGetIntegerv(GL_MAX_RENDERBUFFER_SIZE, &maxFBOSize);
  if( width < 0 || width > maxFBOSize ||
      height < 0 || height > maxFBOSize) {
    RCTLogError(@"Can't resize framebuffer. Invalid dimensions");
    return;
  }
  _width = width;
  _height = height;
  
  FBOState *state = [[FBOState alloc] initFromContext];
  
  for (GLTexture *clr in _color) {
    [clr setShapeWithWidth:width withHeight:height];
  }
  
  glBindFramebuffer(GL_FRAMEBUFFER, _handle);
  [self checkStatus];
  
  [state restore];
}

@end

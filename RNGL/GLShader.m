#import <GLKit/GLKit.h>

#import "RCTBridgeModule.h"
#import "RCTLog.h"
#import "RCTConvert.h"
#import "GLUtils.h"
#import "GLShader.h"

/**
 * a GLShader represents the atomic component of GL React Native.
 * It currently statically holds a program that renders 2 static triangles over the full viewport (2D)
 */
@implementation GLShader
{
  EAGLContext *_context; // Context related to this shader
  GLuint program; // Program of the shader
  GLuint buffer; // the buffer currently contains 2 static triangles covering the surface
  GLint pointerLoc; // The "pointer" attribute is used to iterate over vertex
  NSDictionary *_uniformTypes; // The types of the GLSL uniforms (N.B: array are not supported)
  NSDictionary *_uniformLocations; // The uniform locations cache
}

- (instancetype)initWithContext: (EAGLContext*)context withVert:(NSString *)vert withFrag:(NSString *)frag
{
  self = [super init];
  if (self) {
    _context = context;
    _vert = vert;
    _frag = frag;
    [self makeProgram];
  }
  return self;
}

- (void)dealloc
{
  glDeleteProgram(program);
  glDeleteBuffers(1, &buffer);
}

- (bool) ensureContext
{
  if (![EAGLContext setCurrentContext:_context]) {
    RCTLogError(@"Failed to set current OpenGL context");
    return false;
  }
  return true;
}

- (void) bind
{
  if (![self ensureContext]) return;
  if ( glIsProgram(program) != GL_TRUE ){
    RCTLogError(@"not a program!");
    return;
  }
  glUseProgram(program);
  glBindBuffer(GL_ARRAY_BUFFER, buffer);
  glEnableVertexAttribArray(pointerLoc);
  glVertexAttribPointer(pointerLoc, 2, GL_FLOAT, GL_FALSE, 0, 0);
}

- (void) setUniform: (NSString *)name withValue:(id)value
{
  if ([_uniformLocations objectForKey:name] == nil) {
    RCTLogError(@"uniform '%@' does not exist", name);
    return;
  }
  GLint location = [_uniformLocations[name] intValue];
  GLenum type = [_uniformTypes[name] intValue];

  switch (type)
  {
    case GL_FLOAT: {
      NSNumber *v = [RCTConvert NSNumber:value];
      if (!v) {
        RCTLogError(@"uniform '%@' should be a float", name);
        return;
      }
      glUniform1f(location, [v floatValue]);
      break;
    }

    case GL_INT: {
      NSNumber *v = [RCTConvert NSNumber:value];
      if (!v) {
        RCTLogError(@"uniform '%@' should be a int", name);
        return;
      }
      glUniform1i(location, [v intValue]);
      break;
    }

    case GL_BOOL: {
      BOOL v = [RCTConvert BOOL:value];
      glUniform1i(location, v ? 1 : 0);
      break;
    }

    case GL_FLOAT_VEC2: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=2) {
        RCTLogError(@"uniform '%@' should be an array of 2 numbers", name);
        return;
      }
      GLfloat arr[2];
      for (int i=0; i<2; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniform2fv(location, 1, arr);
      break;
    }
      
    case GL_FLOAT_VEC3: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=3) {
        RCTLogError(@"uniform '%@' should be an array of 3 numbers", name);
        return;
      }
      GLfloat arr[3];
      for (int i=0; i<3; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniform3fv(location, 1, arr);
      break;
    }
      
    case GL_FLOAT_VEC4: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=4) {
        RCTLogError(@"uniform '%@' should be an array of 4 numbers", name);
        return;
      }
      GLfloat arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniform4fv(location, 1, arr);
      break;
    }
      
    case GL_BOOL_VEC2:
    case GL_INT_VEC2: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=2) {
        RCTLogError(@"uniform '%@' should be an array of 2 numbers", name);
        return;
      }
      GLint arr[2];
      for (int i=0; i<2; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n intValue];
      }
      glUniform2iv(location, 1, arr);
      break;
    }
      
    case GL_BOOL_VEC3:
    case GL_INT_VEC3: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=3) {
        RCTLogError(@"uniform '%@' should be an array of 3 numbers", name);
        return;
      }
      GLint arr[3];
      for (int i=0; i<3; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n intValue];
      }
      glUniform3iv(location, 1, arr);
      break;
    }
      
    case GL_BOOL_VEC4:
    case GL_INT_VEC4: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=4) {
        RCTLogError(@"uniform '%@' should be an array of 4 numbers", name);
        return;
      }
      GLint arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n intValue];
      }
      glUniform4iv(location, 1, arr);
      break;
    }
      
    case GL_FLOAT_MAT2: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=4) {
        RCTLogError(@"uniform '%@' should be an array of 4 numbers (matrix)", name);
        return;
      }
      GLfloat arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniformMatrix2fv(location, 1, false, arr);
      break;
    }
      
    case GL_FLOAT_MAT3: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=9) {
        RCTLogError(@"uniform '%@' should be an array of 9 numbers (matrix)", name);
        return;
      }
      GLfloat arr[9];
      for (int i=0; i<9; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniformMatrix3fv(location, 1, false, arr);
      break;
    }
      
    case GL_FLOAT_MAT4: {
      NSArray *v = [RCTConvert NSArray:value];
      if (!v || [v count]!=16) {
        RCTLogError(@"uniform '%@' should be an array of 16 numbers (matrix)", name);
        return;
      }
      GLfloat arr[16];
      for (int i=0; i<16; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"uniform '%@' array should only contains numbers", name);
          return;
        }
        arr[i] = [n floatValue];
      }
      glUniformMatrix4fv(location, 1, false, arr);
      break;
    }

    case GL_SAMPLER_CUBE:
    case GL_SAMPLER_2D: {
      NSInteger v = [RCTConvert NSInteger:value];
      glUniform1i(location, (int) v);
      break;
    }

    default:
      RCTLogError(@"uniform '%@': unsupported type %i", name, type);
  }
}

- (void) validate
{
  glValidateProgram(program);
  GLint validSuccess;
  glGetProgramiv(program, GL_VALIDATE_STATUS, &validSuccess);
  if (validSuccess == GL_FALSE) {
    GLchar messages[256];
    glGetProgramInfoLog(program, sizeof(messages), 0, &messages[0]);
    NSString *messageString = [NSString stringWithUTF8String:messages];
    RCTLogError(@"GL: Validation failed %@", messageString);
  }
}

- (void) computeMeta
{
  NSMutableDictionary *uniforms = @{}.mutableCopy;
  NSMutableDictionary *locations = @{}.mutableCopy;
  int nbUniforms;
  GLchar name[256];
  GLenum type;
  GLint size;
  GLsizei length;
  glGetProgramiv(program, GL_ACTIVE_UNIFORMS, &nbUniforms);
  for (int i=0; i<nbUniforms; i++) {
    glGetActiveUniform(program, i, sizeof(name), &length, &size, &type, name);
    GLint location = glGetUniformLocation(program, name);
    NSString *uniformName = [NSString stringWithUTF8String:name];
    uniforms[uniformName] = [NSNumber numberWithInt:type];
    locations[uniformName] = [NSNumber numberWithInt:location];

  }
  _uniformTypes = uniforms;
  _uniformLocations = locations;
}

- (void) makeProgram
{
  if (![self ensureContext]) return;
  
  glEnable(GL_BLEND);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

  GLuint vertex = compileShader(_vert, GL_VERTEX_SHADER);
  if (vertex == -1) return;

  GLuint fragment = compileShader(_frag, GL_FRAGMENT_SHADER);
  if (fragment == -1) return;

  program = glCreateProgram();
  glAttachShader(program, vertex);
  glAttachShader(program, fragment);
  glLinkProgram(program);

  GLint linkSuccess;
  glGetProgramiv(program, GL_LINK_STATUS, &linkSuccess);
  if (linkSuccess == GL_FALSE) {
    GLchar messages[256];
    glGetProgramInfoLog(program, sizeof(messages), 0, &messages[0]);
    NSString *messageString = [NSString stringWithUTF8String:messages];
    RCTLogError(@"GL: Linking failed %@", messageString);
    return;
  }

  glUseProgram(program);

  [self computeMeta];

  pointerLoc = glGetAttribLocation(program, "position");

  glGenBuffers(1, &buffer);
  glBindBuffer(GL_ARRAY_BUFFER, buffer);
  GLfloat buf[] = {
    -1.0, -1.0,
    1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
    1.0, -1.0,
    1.0,  1.0
  };
  glBufferData(GL_ARRAY_BUFFER, sizeof(buf), buf, GL_STATIC_DRAW);
}


@end

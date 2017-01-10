#import <GLKit/GLKit.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import "GLShader.h"

GLuint compileShader (NSString* shaderName, NSString* shaderString, GLenum shaderType, NSError **error) {
  
  GLuint shaderHandle = glCreateShader(shaderType);
  
  const char * shaderStringUTF8 = [shaderString UTF8String];
  int shaderStringLength = (int) [shaderString length];
  glShaderSource(shaderHandle, 1, &shaderStringUTF8, &shaderStringLength);
  
  glCompileShader(shaderHandle);
  
  GLint compileSuccess;
  glGetShaderiv(shaderHandle, GL_COMPILE_STATUS, &compileSuccess);
  if (compileSuccess == GL_FALSE) {
    GLchar messages[256];
    glGetShaderInfoLog(shaderHandle, sizeof(messages), 0, &messages[0]);
    *error = [[NSError alloc]
              initWithDomain:[NSString stringWithUTF8String:messages]
              code:GLCompileFailure
              userInfo:nil];
    return -1;
  }
  
  return shaderHandle;
}

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
  NSDictionary *_uniformTypes; // The types of the GLSL uniforms
  NSDictionary *_uniformSizes; // The size of the uniform variable
  NSDictionary *_uniformLocations; // The uniform locations cache
  NSArray *__uniformNames; // The uniforms names
  NSError *_error;
}

- (instancetype)initWithContext: (EAGLContext*)context withName:(NSString *)name withVert:(NSString *)vert withFrag:(NSString *)frag
{
  self = [super init];
  if (self) {
    _name = name;
    _context = context;
    _vert = vert;
    _frag = frag;
    NSError *error;
    if (![self makeProgram:&error]) {
      _error = error;
    }
  }
  return self;
}

- (void)dealloc
{
  glDeleteProgram(program);
  glDeleteBuffers(1, &buffer);
  _name = nil;
  _context = nil;
  _vert = nil;
  _frag = nil;
  _uniformLocations = nil;
  _uniformTypes = nil;
  program = 0;
  buffer = 0;
  pointerLoc = 0;
}

- (bool) ensureContext: (NSError **)error
{
  if (!_context || ![EAGLContext setCurrentContext:_context]) {
    *error = [[NSError alloc] initWithDomain:@"Failed to set current OpenGL context" code:GLContextFailure userInfo:nil];
    return false;
  }
  return true;
}

- (void) bind
{
  glUseProgram(program);
  glBindBuffer(GL_ARRAY_BUFFER, buffer);
  glEnableVertexAttribArray(pointerLoc);
  glVertexAttribPointer(pointerLoc, 2, GL_FLOAT, GL_FALSE, 0, 0);
}

- (void) setUniform: (NSString *)name withValue:(id)value
{
  GLint size = [_uniformSizes[name] intValue];
  GLenum type = [_uniformTypes[name] intValue];
  if (size != 1) {
    NSArray *v = [RCTConvert NSArray:value];
    if (!v || [v count]!=size) {
      RCTLogError(@"Shader '%@': uniform '%@' should be an array of %i elements", _name, name, size);
      return;
    }
    for (int i=0; i<size; i++) {
      NSString *indexName = [NSString stringWithFormat:@"%@[%i]", name, i];
      id indexValue = v[i];
      [self setUniform:indexName withValue:indexValue];
    }
    return;
  }
  
  if ([_uniformLocations objectForKey:name] == nil) {
    RCTLogError(@"Shader '%@': uniform '%@' does not exist", _name, name);
    return;
  }
  GLint location = [_uniformLocations[name] intValue];
  
  switch (type)
  {
    case GL_FLOAT: {
      NSNumber *v = [RCTConvert NSNumber:value];
      if (!v) {
        RCTLogError(@"Shader '%@': uniform '%@' should be a float", _name, name);
        return;
      }
      glUniform1f(location, [v floatValue]);
      break;
    }

    case GL_INT: {
      NSNumber *v = [RCTConvert NSNumber:value];
      if (!v) {
        RCTLogError(@"Shader '%@': uniform '%@' should be a int", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 2 numbers", _name, name);
        return;
      }
      GLfloat arr[2];
      for (int i=0; i<2; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 3 numbers", _name, name);
        return;
      }
      GLfloat arr[3];
      for (int i=0; i<3; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 4 numbers", _name, name);
        return;
      }
      GLfloat arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 2 numbers", _name, name);
        return;
      }
      GLint arr[2];
      for (int i=0; i<2; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 3 numbers", _name, name);
        return;
      }
      GLint arr[3];
      for (int i=0; i<3; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 4 numbers", _name, name);
        return;
      }
      GLint arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 4 numbers (matrix)", _name, name);
        return;
      }
      GLfloat arr[4];
      for (int i=0; i<4; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 9 numbers (matrix)", _name, name);
        return;
      }
      GLfloat arr[9];
      for (int i=0; i<9; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
        RCTLogError(@"Shader '%@': uniform '%@' should be an array of 16 numbers (matrix)", _name, name);
        return;
      }
      GLfloat arr[16];
      for (int i=0; i<16; i++) {
        NSNumber *n = [RCTConvert NSNumber: v[i]];
        if (!n) {
          RCTLogError(@"Shader '%@': uniform '%@' array should only contains numbers", _name, name);
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
      RCTLogError(@"Shader '%@': uniform '%@': unsupported type %i", _name, name, type);
  }
}

- (void) computeMeta
{
  NSMutableArray *uniformNames = [[NSMutableArray alloc] init];
  NSMutableDictionary *uniformTypes = @{}.mutableCopy;
  NSMutableDictionary *locations = @{}.mutableCopy;
  NSMutableDictionary *sizes = @{}.mutableCopy;
  int nbUniforms;
  GLchar name[256];
  GLenum type;
  GLint size;
  GLsizei length;
  glGetProgramiv(program, GL_ACTIVE_UNIFORMS, &nbUniforms);
  for (int i=0; i<nbUniforms; i++) {
    glGetActiveUniform(program, i, sizeof(name), &length, &size, &type, name);
    NSString *uniformName = [NSString stringWithUTF8String:name];
    if ([uniformName containsString:@"[0]"]) {
      uniformName = [uniformName substringToIndex:[uniformName length]-3];
    }
    uniformTypes[uniformName] = [NSNumber numberWithInt:type];
    sizes[uniformName] = [NSNumber numberWithInt:size];
    [uniformNames addObject:uniformName];
    
    if (size == 1) {
      GLint location = glGetUniformLocation(program, name);
      locations[uniformName] = [NSNumber numberWithInt:location];
    }
    else {
      for (int j=0; j<size; j++) {
        NSString *uniformIndexName = [NSString stringWithFormat:@"%@[%i]", uniformName, j];
        GLint location = glGetUniformLocation(program, [uniformIndexName UTF8String]);
        locations[uniformIndexName] = [NSNumber numberWithInt:location];
        uniformTypes[uniformIndexName] = [NSNumber numberWithInt:type];
        sizes[uniformIndexName] = [NSNumber numberWithInt:1];
      }
    }
  }
  
  _uniformTypes = uniformTypes;
  _uniformLocations = locations;
  _uniformSizes = sizes;
  _uniformNames = uniformNames;
}

- (bool) ensureCompiles: (NSError **)error
{
  if (![self ensureContext:error]) {
    return false;
  }
  if (!glIsProgram(program)) {
    *error = [[NSError alloc] initWithDomain:@"not a program" code:GLNotAProgram userInfo:nil];
    return false;
  }
  if (_error == nil) return true;
  *error = _error;
  return false;
}

- (bool) makeProgram: (NSError **)error
{
  if (![self ensureContext:error]) return false;

  GLuint vertex = compileShader(_name, _vert, GL_VERTEX_SHADER, error);
  if (vertex == -1) return false;

  GLuint fragment = compileShader(_name, _frag, GL_FRAGMENT_SHADER, error);
  if (fragment == -1) return false;

  program = glCreateProgram();
  glAttachShader(program, vertex);
  glAttachShader(program, fragment);
  glLinkProgram(program);

  GLint linkSuccess;
  glGetProgramiv(program, GL_LINK_STATUS, &linkSuccess);
  if (linkSuccess == GL_FALSE) {
    GLchar messages[256];
    glGetProgramInfoLog(program, sizeof(messages), 0, &messages[0]);
    *error = [[NSError alloc]
              initWithDomain:[NSString stringWithUTF8String:messages]
              code:GLLinkingFailure
              userInfo:nil];
    return false;
  }

  glUseProgram(program);

  [self computeMeta];

  pointerLoc = glGetAttribLocation(program, "position");

  glGenBuffers(1, &buffer);
  glBindBuffer(GL_ARRAY_BUFFER, buffer);
  GLfloat buf[] = {
    -1.0, -1.0,
    -1.0, 4.0,
     4.0,  -1.0
  };
  glBufferData(GL_ARRAY_BUFFER, sizeof(buf), buf, GL_STATIC_DRAW);
    
  return true;
}


@end

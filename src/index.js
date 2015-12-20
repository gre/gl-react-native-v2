const invariant = require("invariant");
const { Shaders } = require("gl-react");
const Surface = require("./Surface");
const { NativeModules: { RNGLContext } } = require("react-native");
invariant(RNGLContext,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

React.NativeModules.RNGLContext is %s`, RNGLContext);

// Hook Shaders to RNGLContext
Shaders.list().map(id => RNGLContext.addShader(id, Shaders.get(id)));
Shaders.on("add", (id, shader) => RNGLContext.addShader(id, shader));

module.exports = {
  Surface
};

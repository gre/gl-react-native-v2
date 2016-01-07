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
Shaders.on("add", (id, shader, onCompile) => RNGLContext.addShader(id, shader, onCompile));
Shaders.on("remove", id => RNGLContext.removeShader(id));

module.exports = {
  Surface
};

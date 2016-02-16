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
Shaders.setImplementation({
  add: (id, shader) =>
  new Promise((resolve, reject) =>
    RNGLContext.addShader(id, shader, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    })),
  remove: id => RNGLContext.removeShader(id)
});

module.exports = {
  Surface
};

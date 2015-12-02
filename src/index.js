const { Shaders } = require("gl-react-core");
const Surface = require("./Surface");
const { NativeModules: { RNGLContext } } = require("react-native");

// Hook Shaders to RNGLContext
Shaders.list().map(id => RNGLContext.addShader(id, Shaders.get(id)));
Shaders.on("add", (id, shader) => RNGLContext.addShader(id, shader));

module.exports = {
  Surface
};

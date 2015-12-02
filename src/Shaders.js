const {createShaders} = require("gl-react");
const { NativeModules: { RNGLContext } } = require("react-native");

module.exports = createShaders(function (id, shader) {
  RNGLContext.addShader(id, shader);
});

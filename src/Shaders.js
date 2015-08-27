const {createShaders} = require("gl-react-core");
const { NativeModules: { GLShadersRegistry } } = require("react-native");

module.exports = createShaders(function (id, shader) {
  GLShadersRegistry.register(id, shader);
});

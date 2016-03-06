import invariant from "invariant";
import { Shaders } from "gl-react";
import Surface from "./Surface";
import {NativeModules} from "react-native";
const {RNGLContext} = NativeModules;
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

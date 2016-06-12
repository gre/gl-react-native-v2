import invariant from "invariant";
import { Shaders } from "gl-react";
import isAnimated from "gl-react/src/isAnimated";
import makeSurface from "./makeSurface";
import GLCanvas from "./GLCanvas";
import {NativeModules, View, Animated} from "react-native";
const {RNGLContext} = NativeModules;
invariant(RNGLContext,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

NativeModules.RNGLContext is %s`, RNGLContext);

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
  Surface: makeSurface({
    View,
    GLCanvas,
    dimensionInvariant: (value, field) =>
      isAnimated(value)
      ? invariant(false, "GL.Surface "+field+" prop cannot be an Animated object. Use GL.AnimatedSurface instead")
      : invariant(typeof value === "number" && value > 0, "GL.Surface: "+field+" prop must be a strictly positive number")
  }),
  AnimatedSurface: makeSurface({
    View: Animated.View,
    GLCanvas: Animated.createAnimatedComponent(GLCanvas),
    dimensionInvariant: (value, field) =>
      invariant(
        isAnimated(value) || typeof value === "number" && value > 0,
        "GL.AnimatedSurface: "+field+" must be a strictly positive number OR an Animated object"
      )
  }),
};

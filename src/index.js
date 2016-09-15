import invariant from "invariant";
import { Shaders, runtime } from "gl-react";
import isAnimated from "gl-react/src/isAnimated";
import makeSurface from "./makeSurface";
import GLCanvas from "./GLCanvas";
import {NativeModules, View, Animated, Image} from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

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

if (__DEV__) {
  runtime.decorateVDOMContent = vdom => {
    if (vdom && vdom.type === Image && !vdom.props.glReactUseImage) {
      console.warn(
`gl-react: Found a ReactNative.Image element. This is not performant. Try one of these:
- pass-in directly the image URL in your uniforms.
- use gl-react-image which implements the same Image API directly in OpenGL. https://github.com/gre/gl-react-image
- If you need more features like padding, explicitly setting image size, you can implement your own shader.

If you still want to do this, add a glReactUseImage prop to the Image to disable this warning.
`);
    }
    return vdom;
  };
}

module.exports = {
  resolveAssetSource,
  Surface: makeSurface({
    View,
    GLCanvas,
    getGLCanvas: glSurface => glSurface.refs.canvas,
    dimensionInvariant: (value, field) =>
      isAnimated(value)
      ? invariant(false, "GL.Surface "+field+" prop cannot be an Animated object. Use GL.AnimatedSurface instead")
      : invariant(typeof value === "number" && value > 0, "GL.Surface: "+field+" prop must be a strictly positive number")
  }),
  AnimatedSurface: makeSurface({
    View: Animated.View,
    GLCanvas: Animated.createAnimatedComponent(GLCanvas),
    getGLCanvas: ({ refs: { canvas }}) => canvas._component || canvas.refs.node,
    dimensionInvariant: (value, field) =>
      invariant(
        isAnimated(value) || typeof value === "number" && value > 0,
        "GL.AnimatedSurface: "+field+" must be a strictly positive number OR an Animated object"
      )
  }),
};

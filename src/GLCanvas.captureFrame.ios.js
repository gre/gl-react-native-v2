import invariant from "invariant";
import React from "react-native";
const {
  NativeModules: { GLCanvasManager }
} = React;
invariant(GLCanvasManager,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

React.NativeModules.GLCanvasManager is %s`, GLCanvasManager);

module.exports = (handle, config) => GLCanvasManager.capture(handle, config);

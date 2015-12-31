const invariant = require("invariant");
const React = require("react-native");
const {
  NativeModules: { UIManager }
} = React;
const {GLCanvas} = UIManager;
invariant(GLCanvas,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

React.NativeModules.UIManager.GLCanvas is %s`, GLCanvas);
const {Commands} = GLCanvas;

module.exports = (handle, config) => UIManager.dispatchViewManagerCommand(handle, Commands.captureFrame, [ config ]);

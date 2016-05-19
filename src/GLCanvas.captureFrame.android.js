import invariant from "invariant";
import {NativeModules} from "react-native";
const {UIManager} = NativeModules;
const {GLCanvas} = UIManager;
invariant(GLCanvas,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

NativeModules.UIManager.GLCanvas is %s`, GLCanvas);
const {Commands} = GLCanvas;

module.exports = (handle, config) => UIManager.dispatchViewManagerCommand(handle, Commands.captureFrame, [ config ]);

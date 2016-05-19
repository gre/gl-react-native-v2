import invariant from "invariant";
import { NativeModules } from "react-native";
const { GLCanvasManager } = NativeModules;
invariant(GLCanvasManager,
`gl-react-native: the native module is not available.
Make sure you have properly configured it.
See README install instructions.

NativeModules.GLCanvasManager is %s`, GLCanvasManager);

module.exports = (handle, config) => GLCanvasManager.capture(handle, config);

import { AppRegistry, StatusBarIOS } from "react-native";
import example from "./src";
StatusBarIOS.setHidden(true);
AppRegistry.registerComponent("example", () => example);

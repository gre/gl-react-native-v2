import { AppRegistry, StatusBar } from "react-native";
import example from "./src";
StatusBar.setHidden(true);
AppRegistry.registerComponent("example", () => example);

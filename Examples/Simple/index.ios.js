import { AppRegistry, StatusBarIOS } from "react-native";
const Simple = require("./src");
StatusBarIOS.setHidden(true);
AppRegistry.registerComponent("Simple", () => Simple);

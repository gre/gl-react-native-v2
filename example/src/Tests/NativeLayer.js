import React from "react";
import {View} from "react-native";

class NativeLayer extends React.Component {
  render () {
    const { width, height, children, ...rest } = this.props;
    return <View style={{ width, height, position: "relative", overflow: "hidden" }}>
      {React.Children.map(children, child =>
        <View style={{ width, height, position: "absolute", top: 0, left: 0, backgroundColor: "transparent" }}>
          {child}
        </View>
      )}
    </View>;
  }
}

module.exports = NativeLayer;

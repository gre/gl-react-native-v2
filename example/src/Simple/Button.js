import React, {Component} from "react";
import {StyleSheet, View, Text, TouchableOpacity} from "react-native";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#ddd",
    borderRadius: 4,
    borderColor: "#ccc",
    borderWidth: 1,
    borderStyle: "solid",
    width: 150,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#333",
  }
});

class Button extends Component {
  render () {
    const { children, style, textStyle, ...rest } = this.props;
    return (
      <TouchableOpacity {...rest}>
        <View style={[ style, styles.root ]}>
          <Text
            style={[
              styles.text,
              textStyle,
            ]}>
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

Button.propTypes = {
};

module.exports = Button;

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
    padding: 10
  },
  text: {
    color: "#333"
  }
});

class Button extends Component {
  render () {
    const { children, width, ...rest } = this.props;
    return (
      <TouchableOpacity {...rest}>
        <View style={[ {width}, styles.root ]}>
          <Text style={styles.text}>{children}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

Button.propTypes = {
};

module.exports = Button;

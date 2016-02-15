const React = require("react-native");
const {
  View
} = React;

class NativeLayer extends React.Component {
  render () {
    const { width, height, children, ...rest } = this.props;
    return <View style={{ width, height, position: "relative" }}>
      {React.Children.map(children, child =>
        <View style={{ width, height, position: "absolute", top: 0, left: 0, backgroundColor: "transparent" }}>
          {child}
        </View>
      )}
    </View>;
  }
}

module.exports = NativeLayer;

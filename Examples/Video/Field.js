const React = require("react-native");
const {
  View,
  Text,
  SliderIOS
} = React;
const styles = {
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  title: {
    width: 140,
    textAlign: "right",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 16,
    fontFamily: "Helvetica"
  },
  range: {
    flex: 1,
    height: 50
  }
};

class Field extends React.Component {
  render () {
    const { min, max, step, onChange, name, width } = this.props;
    return <View style={{...styles.field, width }}>
      <Text style={styles.title}>{name}</Text>
      <SliderIOS
        style={styles.range}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
      />
  </View>;
  }
}
module.exports = Field;

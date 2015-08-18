const React = require("react-native");
const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  SliderIOS,
} = React;

const HelloGL = require("./HelloGL");
const Saturation = require("./Saturation");
const HueRotate = require("./HueRotate");

class Simple extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      saturationFactor: 1,
      hue: 0,
      text: "and I will return leading the pack"
    };
  }

  render () {

    const {
      saturationFactor,
      hue,
      text
    } = this.state;

    return <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Welcome to GL React Native!
      </Text>
      <View style={styles.demos}>

        <Text style={styles.demoTitle}>1. Hello GL</Text>
        <View style={styles.demo}>
          <HelloGL width={256} height={171} />
        </View>

        <Text style={styles.demoTitle}>2. Saturation on an Image</Text>
        <View style={styles.demo}>
          <Saturation
            width={256}
            height={171}
            factor={saturationFactor}
            image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
          />
        <SliderIOS
          value={saturationFactor}
          maximumValue={8}
          onValueChange={saturationFactor => this.setState({ saturationFactor })}
        />
        </View>

        <Text style={styles.demoTitle}>3. Hue Rotation on Text + Image</Text>
        <View style={styles.demo}>
          <HueRotate
            width={256}
            height={180}
            hue={hue}>
            <Image style={{ width: 256, height: 244 }} source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }}/>
            <Text style={styles.demoText1}>Throw me to the wolves</Text>
            <Text style={styles.demoText2}>{text}</Text>
          </HueRotate>
          <SliderIOS
            value={hue}
            maximumValue={2 * Math.PI}
            onValueChange={hue => this.setState({ hue })}
          />
          <TextInput
            style={{ height: 30, borderColor: "#aaa", borderWidth: 1 }}
            onChangeText={text => this.setState({ text })}
            value={text}
          />
        </View>

      </View>
    </ScrollView>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 5,
    marginBottom: 20,
    fontWeight: "bold"
  },
  demos: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  demoTitle: {
    fontSize: 20,
    margin: 5,
    fontStyle: "italic"
  },
  demoText1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 256,
    textAlign: "center",
    color: "#f16",
    backgroundColor: "transparent",
    fontWeight: "400",
    fontSize: 24,
    letterSpacing: 0
  },
  demoText2: {
    position: "absolute",
    bottom: 4,
    left: 0,
    width: 256,
    textAlign: "center",
    color: "#7bf",
    backgroundColor: "transparent",
    fontWeight: "300",
    fontSize: 32,
    letterSpacing: -1
  },
});

AppRegistry.registerComponent("Simple", () => Simple);

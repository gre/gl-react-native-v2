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
  SwitchIOS,
  ProgressViewIOS,
  ActivityIndicatorIOS,
} = React;

const HelloGL = require("./HelloGL");
const Saturation = require("./Saturation");
const HueRotate = require("./HueRotate");
const PieProgress = require("./PieProgress");
const OneFingerResponse = require("./OneFingerResponse");
const AnimatedHelloGL = require("./AnimatedHelloGL");
const Blur = require("./Blur");
const Button = require("./Button");

class Simple extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      saturationFactor: 1,
      hue: 0,
      progress: 0,
      factor: 0,
      text: "and I will return leading the pack",
      switch1: false,
      switch2: false,
      switch3: false,
      captured: null
    };
    this.onCapture1 = this.onCapture1.bind(this);
  }

  onCapture1 () {
    this.refs.helloGL.captureFrame(data64 => {
      this.setState({ captured: data64 });
    });
  }

  render () {
    const {
      saturationFactor,
      hue,
      text,
      progress,
      factor,
      switch1,
      switch2,
      switch3,
      captured
    } = this.state;

    return <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Welcome to GL React Native!
      </Text>
      <View style={styles.demos}>

        <Text style={styles.demoTitle}>1. Hello GL</Text>
        <View style={styles.demo}>
          <HelloGL width={256} height={171} ref="helloGL" />
          <View style={{ paddingTop: 20, alignItems: "center", flexDirection: "row" }}>
            <Button onPress={this.onCapture1}>captureFrame()</Button>
            {captured && <Image source={{ uri:captured }} style={{ marginLeft: 20, width: 51, height: 34 }} />}
          </View>
        </View>

        <Text style={styles.demoTitle}>2. Saturate an Image</Text>
        <View style={styles.demo}>
          <Saturation
            width={256}
            height={171}
            factor={saturationFactor}
            image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
          />
        <SliderIOS
          maximumValue={8}
          onValueChange={saturationFactor => this.setState({ saturationFactor })}
        />
        </View>

        <Text style={styles.demoTitle}>3. Hue Rotate on Text+Image</Text>
        <View style={styles.demo}>
          <HueRotate
            autoRedraw
            width={256}
            height={180}
            hue={hue}>
            <Image style={{ width: 256, height: 244 }} source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }}/>
            <Text style={styles.demoText1}>Throw me to the wolves</Text>
            <Text style={styles.demoText2}>{text}</Text>
          </HueRotate>
          <SliderIOS
            maximumValue={2 * Math.PI}
            onValueChange={hue => this.setState({ hue })}
          />
          <TextInput
            style={{ height: 30, borderColor: "#aaa", borderWidth: 1 }}
            onChangeText={text => this.setState({ text })}
            value={text}
          />
        </View>

        <Text style={styles.demoTitle}>4. Progress Indicator</Text>
        <View style={styles.demo}>
          <PieProgress
            width={256}
            height={180}
            progress={progress}
          />
          <SliderIOS
            onValueChange={progress => this.setState({ progress })}
          />
        </View>

        <Text style={styles.demoTitle}>5. Touch Responsive</Text>
        <View style={styles.demo}>
          <OneFingerResponse
            width={256}
            height={180}
          />
        </View>

        <Text style={styles.demoTitle}>6. Animation</Text>
        <View style={styles.demo}>
          <AnimatedHelloGL
            width={256}
            height={180}
          />
        </View>

        <Text style={styles.demoTitle}>7. Blur (2-pass)</Text>
        <View style={styles.demo}>
          <Blur width={256} height={180} factor={factor}>
            http://i.imgur.com/3On9QEu.jpg
          </Blur>
          <SliderIOS
            maximumValue={2}
            onValueChange={factor => this.setState({ factor })} />
        </View>


        <Text style={styles.demoTitle}>8. Blur+Hue over UI</Text>
        <View style={styles.demo}>
          <HueRotate
            hue={-switch1 + 2 * switch2 + 4 * switch3}
            width={256}
            height={160}
            autoRedraw
            eventsThrough
            visibleContent>
            <Blur
              width={256}
              height={160}
              factor={factor}>
              <Blur
                width={256}
                height={160}
                factor={factor/2}>
                <View style={{ width: 256, height: 160, padding: 10 }}>
                  <SliderIOS
                    style={{ height: 80 }}
                    maximumValue={2}
                    onValueChange={factor => this.setState({ factor })}
                  />
                <View style={{ height: 60, flexDirection: "row", alignItems: "center" }}>
                  <SwitchIOS style={{flex:1}} value={switch1} onValueChange={switch1 => this.setState({ switch1 })} />
                  <SwitchIOS style={{flex:1}} value={switch2} onValueChange={switch2 => this.setState({ switch2 })} />
                  <SwitchIOS style={{flex:1}} value={switch3} onValueChange={switch3 => this.setState({ switch3 })} />
                </View>
                <ProgressViewIOS progress={factor} style={{height: 10, marginTop: 8, flex:1}} />

                </View>
              </Blur>
            </Blur>
          </HueRotate>
        </View>

        <Text style={styles.demoTitle}>9. Texture from array</Text>
        <View style={styles.demo}>
          <Text>Not Supported Yet</Text>
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
    marginLeft: 40,
    width: 276,
    marginBottom: 40,
  },
  demoTitle: {
    marginBottom: 16,
    fontStyle: "italic",
    alignSelf: "flex-start",
    color: "#999",
    fontWeight: "300",
    fontSize: 20,
  },
  demo: {
    marginBottom: 64,
    marginLeft: 20,
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

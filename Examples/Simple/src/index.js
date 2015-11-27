const React = require("react-native");
const {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Component,
} = React;

const {
  mdl: {
    Progress,
    Slider,
    Switch
  },
  MKButton,
} = require("react-native-material-kit");

const HelloGL = require("./HelloGL");
const Saturation = require("./Saturation");
const HueRotate = require("./HueRotate");
const PieProgress = require("./PieProgress");
const OneFingerResponse = require("./OneFingerResponse");
const AnimatedHelloGL = require("./AnimatedHelloGL");
const Blur = require("./Blur");
const Button = require("./Button");

class Demo extends Component {
  render () {
    const { title, children } = this.props;
    return <View>
      <Text style={styles.demoTitle}>{title}</Text>
      <View style={styles.demo}>
        {children}
      </View>
    </View>;
  }
}

class Demos extends Component {
  render () {
    const { children, onChange, value } = this.props;
    return <View>
      <View style={styles.nav}>
        {React.Children.map(children, (demo, i) =>
          <MKButton
            style={{ flex: 1, padding: 10 }}
            onPress={() => onChange(i)}>
            <Text pointerEvents="none"
              style={{
                textAlign: "center",
                color: i!==value ? "#123" : "#69c",
                fontWeight: "bold"
              }}>
              {""+(i+1)}
            </Text>
          </MKButton>)}
      </View>
      <View style={styles.demos}>
        {children[value]}
      </View>
  </View>;
  }
}

class Simple extends Component {
  constructor (props) {
    super(props);
    this.state = {
      current: 0,
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
      current,
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

    return <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to GL React Native!
      </Text>

      <Demos onChange={current => this.setState({ current })} value={current}>
        <Demo title="1. Hello GL">
          <HelloGL width={256} height={171} ref="helloGL" />
          <View style={{ paddingTop: 20, alignItems: "center", flexDirection: "row" }}>
            <Button onPress={this.onCapture1}>captureFrame()</Button>
            {captured && <Image source={{ uri:captured }} style={{ marginLeft: 20, width: 51, height: 34 }} />}
          </View>
        </Demo>

        <Demo title="2. Saturate an Image">
          <Saturation
              width={256}
              height={171}
              factor={saturationFactor}
              image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
            />
          <Slider
            max={8}
            onChange={saturationFactor => this.setState({ saturationFactor })}
          />
        </Demo>

        <Demo id={3} current={current} title="3. Hue Rotate on Text+Image">
          <HueRotate
            autoRedraw
            width={256}
            height={180}
            hue={hue}>
            <Image style={{ width: 256, height: 244 }} source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }}/>
            <Text style={styles.demoText1}>Throw me to the wolves</Text>
            <Text style={styles.demoText2}>{text}</Text>
          </HueRotate>
          <Slider
            max={2 * Math.PI}
            onChange={hue => this.setState({ hue })}
          />
          <TextInput
            style={{ height: 40, borderColor: "#aaa", borderWidth: 1 }}
            onChangeText={text => this.setState({ text })}
            value={text}
          />
        </Demo>

        <Demo id={4} current={current} title="4. Progress Indicator">
          <View style={{ position: "relative", width: 256, height: 180 }}>
            <Image style={{
              width: 256,
              height: 180,
              position: "absolute",
              top: 0,
              left: 0
            }}
            source={{ uri: "http://i.imgur.com/qM9BHCy.jpg" }}/>
            <View style={{ position: "absolute", top: 0, left: 0 }}>
              <PieProgress
                width={256}
                height={180}
                progress={progress}
              />
            </View>
          </View>
          <Slider
            max={1}
            onChange={progress => this.setState({ progress })}
          />
        </Demo>

        <Demo id={5} current={current} title="5. Touch Responsive">
          <OneFingerResponse
            width={256}
            height={180}
          />
        </Demo>

        <Demo id={6} current={current} title="6. Animation">
          <AnimatedHelloGL
            width={256}
            height={180}
          />
        </Demo>

        <Demo id={7} current={current} title="7. Blur (2-pass)">
          <Blur preload width={256} height={180} factor={factor + 1}>
            http://i.imgur.com/3On9QEu.jpg
          </Blur>
          <Slider
            max={2}
            onChange={factor => this.setState({ factor })} />
        </Demo>

        <Demo id={8} current={current} title="8. Blur+Hue over UI">
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
                <View style={{ width: 256, height: 160, padding: 10, backgroundColor: "#F9F9F9" }}>
                  <Slider
                    style={{ height: 80 }}
                    max={2}
                    onChange={factor => this.setState({ factor })}
                  />
                <View style={{ height: 60, flexDirection: "row", alignItems: "center" }}>
                  <Switch style={{flex:1}} checked={switch1} onCheckedChange={({checked:switch1}) => this.setState({ switch1 })} />
                  <Switch style={{flex:1}} checked={switch2} onCheckedChange={({checked:switch2}) => this.setState({ switch2 })} />
                  <Switch style={{flex:1}} checked={switch3} onCheckedChange={({checked:switch3}) => this.setState({ switch3 })} />
                </View>
                <Progress progress={factor} style={{height: 10, marginTop: 8, flex:1}} />

                </View>
              </Blur>
            </Blur>
          </HueRotate>
        </Demo>

        <Demo id={9} current={current} title="9. Texture from array">
          <Text>Not Supported Yet</Text>
        </Demo>

      </Demos>
    </View>;
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
  nav: {
    flexDirection: "row",
    marginBottom: 20
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

module.exports = Simple;

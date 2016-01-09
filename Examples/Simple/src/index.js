const React = require("react-native");
const {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Component,
  TouchableOpacity
} = React;

const { Surface } = require("gl-react-native");

const {
  mdl: {
    Progress,
    Slider,
    Switch
  },
  MKButton,
} = require("react-native-material-kit");

const RNFS = require("react-native-fs");

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
      captured: null,
      captureConfig: null
    };
    this.onCapture1 = this.onCapture1.bind(this);

    /*
    // Crazy stress mode
    const self = this;
    setTimeout(function loop () {
      setTimeout(loop, 100 * Math.random());
      self.setState({ current: Math.floor(8 * Math.random()) });
    }, 100);
    */
  }

  onCapture1 () {
    const captureConfig = {
      quality: Math.round((Math.random() * 100))/100,
      type: Math.random() < 0.5 ? "jpg": "png",
      format: Math.random() < 0.5 ? "base64" : "file"
    };
    if (captureConfig.format === "file") {
      captureConfig.filePath = RNFS.DocumentDirectoryPath+"/hellogl_capture.png";
    }
    this.refs.helloGL
    .captureFrame(captureConfig)
    .then(captured => this.setState({ captured, captureConfig }));
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
      captured,
      captureConfig
    } = this.state;

    return <View style={styles.container}>
      <Text style={styles.title}>
        gl-react-native > Simple
      </Text>

      <Demos onChange={current => this.setState({ current })} value={current}>
        <Demo id={1} title="1. Hello GL">
          <Surface width={256} height={171} ref="helloGL">
            <HelloGL />
          </Surface>
          <View style={{ paddingTop: 20, alignItems: "center", flexDirection: "row" }}>
            <Button onPress={this.onCapture1}>captureFrame()</Button>
            {captured &&
              <Image source={{ uri: captured }}
                style={{ marginLeft: 20, width: 51, height: 34 }}
              /> }
          </View>
          {captureConfig &&
            <View style={{ paddingTop: 20, alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 10 }}>
                format={captureConfig.format}
              </Text>
              <Text style={{ fontSize: 10 }}>
                type={captureConfig.type}
              </Text>
              <Text style={{ fontSize: 10 }}>
                quality={captureConfig.quality+""}
              </Text>
            </View>
          }
          {captured &&
            <Text numberOfLines={1} style={{ marginTop: 10, fontSize: 10, color: "#aaa" }}>
              {captured.slice(0, 100)}
            </Text> }
        </Demo>

        <Demo id={2} title="2. Saturate an Image">
          <Surface width={256} height={171}>
            <Saturation
              factor={saturationFactor}
              image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
            />
          </Surface>
          <Slider
            max={8}
            onChange={saturationFactor => this.setState({ saturationFactor })}
          />
        </Demo>

        <Demo id={3} current={current} title="3. Hue Rotate on Text+Image">
          <Surface autoRedraw width={256} height={180}>
            <HueRotate hue={hue}>
              <Image style={{ width: 256, height: 244 }} source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }}/>
              <Text style={styles.demoText1}>Throw me to the wolves</Text>
              <Text style={styles.demoText2}>{text}</Text>
            </HueRotate>
          </Surface>
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
            <TouchableOpacity>
              <Image source={{ uri: "http://i.imgur.com/qM9BHCy.jpg" }}
                style={{
                  width: 256,
                  height: 180,
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
              />
            </TouchableOpacity>
            <View pointerEvents="box-none" style={{ position: "absolute", top: 0, left: 0, backgroundColor: "transparent" }}>
              <Surface width={256} height={180} opaque={false} eventsThrough>
                <PieProgress progress={progress} width={256} height={180} />
              </Surface>
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
          <Surface preload width={256} height={180}>
            <Blur width={256} height={180} factor={factor + 1}>
              http://i.imgur.com/3On9QEu.jpg
            </Blur>
          </Surface>
          <Slider
            max={2}
            onChange={factor => this.setState({ factor })} />
        </Demo>

        <Demo id={8} current={current} title="8. Blur+Hue over UI">
          <Surface
            width={256}
            height={160}
            autoRedraw
            eventsThrough
            visibleContent>
            <HueRotate hue={-switch1 + 2 * switch2 + 4 * switch3}>
              <Blur
                width={256}
                height={160}
                factor={factor}>
                <View style={{ width: 256, height: 160, padding: 10, backgroundColor: "#f9f9f9" }}>
                  <Slider
                    style={{ height: 80 }}
                    max={1}
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
            </HueRotate>
          </Surface>
          <Text>Note: This is highly experimental and not yet performant enough.</Text>
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

const React = require("react-native");
const {
  AppRegistry,
  StyleSheet,
  View,
  Text,
} = React;
const Camera = require("react-native-camera");
const Video = require("react-native-video").default;
const {
  width: viewportW
} = require("Dimensions").get("window");

const {Surface} = require("gl-react-native");
const HueRotate = require("./HueRotate");
const {Blur} = require("gl-react-blur");

const Field = require("./Field");

const width = viewportW;
const height = Math.round(viewportW * 480/640);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  video: {
    width,
    height
  }
});

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      blur: 0,
      blurPasses: 2,
      hue: 0,
      mode: 0
    };
  }
  render () {
    const { blur, hue, blurPasses, mode } = this.state;
    return (
      <View style={styles.container}>
        <Surface pixelRatio={1} width={640} height={480} autoRedraw eventsThrough width={width} height={height}>
          <Blur passes={blurPasses} factor={blur}>
            <HueRotate hue={hue}>
              {   mode === 0 ?
                <Video source={{ uri: "video" }} repeat style={styles.video} />
                : mode === 1 ?
                <View style={{ flex: 1, backgroundColor: "#fff", padding: 10 }}>
                  <Text style={{ fontSize: 80, color: "#F00" }}>Hello</Text>
                  <Text style={{ fontSize: 60, color: "#00F" }}>World</Text>
                </View>
                : mode === 2 ?
                "http://i.imgur.com/2Go2D7i.jpg"
                : mode === 3 ?
                <Camera style={styles.preview} aspect={Camera.constants.Aspect.Fill} />
                : null
              }
            </HueRotate>
          </Blur>
        </Surface>
        <Field min={0} max={4} step={1} value={mode} onChange={mode => this.setState({ mode })} name="Content" width={width} />
        <Field min={0} max={2*Math.PI} value={hue} onChange={hue => this.setState({ hue })} name="Hue" width={width} />
        <Field min={0} max={16} value={blur} onChange={blur => this.setState({ blur })} name="Blur" width={width} />
        <Field min={2} max={8} step={1} value={blurPasses} onChange={blurPasses => this.setState({ blurPasses })} name="Blur Passes" width={width} />
      </View>
    );
  }
}

AppRegistry.registerComponent("Video", () => App);

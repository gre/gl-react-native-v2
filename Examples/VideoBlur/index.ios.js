const React = require("react-native");
const {
  AppRegistry,
  StyleSheet,
  View,
} = React;
const Video = require("react-native-video");
const {
  width: viewportW
} = require("Dimensions").get("window");

const HueRotate = require("./HueRotate");
const Blur = require("./Blur");
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

class VideoBlur extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      blur: 0,
      blurPasses: 2,
      hue: 0
    };
  }
  render () {
    const { blur, hue, blurPasses } = this.state;
    return (
      <View style={styles.container}>
        <Blur eventsThrough autoRedraw width={width} height={height} passes={blurPasses} factor={blur}>
          <HueRotate hue={hue}>
            <Video source={{ uri: "video" }} repeat style={styles.video} />
          </HueRotate>
        </Blur>
        <Field min={0} max={2*Math.PI} value={hue} onChange={hue => this.setState({ hue })} name="Hue" width={width} />
        <Field min={0} max={16} value={blur} onChange={blur => this.setState({ blur })} name="Blur" width={width} />
        <Field min={2} max={8} step={1} value={blurPasses} onChange={blurPasses => this.setState({ blurPasses })} name="Blur Passes" width={width} />
      </View>
    );
  }
}

AppRegistry.registerComponent("VideoBlur", () => VideoBlur);

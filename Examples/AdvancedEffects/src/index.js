const React = require("react-native");
const {
  StyleSheet,
  View,
} = React;
const { width: viewportW, height: viewportH } = require("Dimensions").get("window");

const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");

const Banner = require("./Banner");
const Intro = require("./Intro");
const Vignette = require("./Vignette");
const Slideshow = require("./Slideshow");

class AdvancedEffects extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      time: 0.02,
      frames: 1,
      embeddedImage: resolveAssetSource(require("./Image.jpg")),
      images:
       //"MQtLWbD,N8a9CkZ,adCmISK,AedZQ4N,y9qRJR3,brzKTYZ,NSyk07l,EaZiWfn,I1KZdnl,DoQBdzT,slIt2Ww,DA12puU,IYLdRFW,oqmO4Po,T6NaLyI,6XAPrAY,thYzbif,4qmqo3o,8xT2J96,ZCa2pWq,loQfDN2,oabfA68,uOXqDRY,MyyS4vK,fhNYTX4"
        "wxqlQkh,G2Whuq3,0bUSEBX,giP58XN,iKdXwVm,IvpoR40,zJIxPEo,CKlmtPs,fnMylHI,vGXYiYy,MnOB9Le,YqsZKgc,0BJobQo,Otbz312"
          .split(",")
          .map(id => `http://imgur.com/${id}.jpg`)
    };
  }

  componentDidMount () {
    let startTime;
    const loop = t => {
      requestAnimationFrame(loop);
      if (!startTime) startTime = t;
      const time = (t - startTime) / 1000;
      this.setState({ time: time, frames: this.state.frames+1 });
    };
    requestAnimationFrame(loop);
  }

  render () {
    const {time, frames, images, embeddedImage} = this.state;

    const nbVignettes = 1;
    const imgW = Math.floor(viewportW/nbVignettes);
    const imgH = Math.floor((2/3)*viewportW/nbVignettes);
    const introH = 100;
    const transitionH = Math.floor((2/3)*viewportW);

    return (
      <View style={styles.root}>
        <Banner
          time={time}
          width={viewportW}
          height={viewportH - introH - imgH - transitionH}
        />
        <Intro
          time={time}
          fps={frames/time}
          width={viewportW}
          height={introH}
        />

        <Vignette
          time={time}
          width={imgW}
          height={imgH}
          source={embeddedImage}
        />

        <Slideshow
          time={time}
          width={viewportW}
          height={transitionH}
          images={images.slice(2)}
          pauseDuration={0.5}
          transitionDuration={1.5}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111"
  }
});

module.exports = AdvancedEffects;

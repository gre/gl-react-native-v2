import React from "react";
import {View, Text, StyleSheet} from "react-native";
import GL from "gl-react";
import {Surface} from "gl-react-native";
import TransitionGenerator from "./TransitionGenerator";
import Transition from "./Transition";

const shaders = GL.Shaders.create(TransitionGenerator.shaders);

class Slideshow extends React.Component {
  constructor (props) {
    super(props);
    this._currentTransition = -1;
  }
  render () {
    const { transitionDuration, pauseDuration, width, height, time, images } = this.props;
    const duration = transitionDuration + pauseDuration;
    const slide = time / duration;
    let transitionProgress = Math.min(1, (duration/transitionDuration) * (slide % 1));
    let transitionFrom = images[Math.floor(slide) % images.length];
    let transitionTo = images[Math.floor(slide+1) % images.length];

    const currentTransition = Math.floor(slide);
    if (currentTransition !== this._currentTransition) {
      this._currentTransition = currentTransition;
      const { name, uniforms } = TransitionGenerator.random();
      this._name = name;
      this._shader = shaders[name];
      this._uniforms = uniforms;
    }

    const transitionName = this._name;
    const transitionShader = this._shader;
    const transitionUniforms = this._uniforms;

    return <View style={styles.root}>
      <Surface width={width} height={height}
        onLoad={() => console.log("Slideshow onLoad")}
        onProgress={e => console.log("Slideshow onProgress", e.nativeEvent)}>
        <Transition
          progress={transitionProgress}
          from={transitionFrom}
          to={transitionTo}
          shader={transitionShader}
          uniforms={transitionUniforms}
          width={width}
          height={height}
        />
      </Surface>
    <View style={styles.legend}>
        <Text style={styles.textName}>{transitionName}</Text>
        <Text style={styles.textInfo}>(GLSL.io)</Text>
      </View>
    </View>;
  }
}

const styles = StyleSheet.create({
  root: {
    position: "relative"
  },
  legend: {
    position: "absolute",
    bottom: 5,
    right: 4,
    backgroundColor: "transparent",
    flexDirection: "row"
  },
  textName: {
    color: "#fff",
    fontWeight: "bold",
  },
  textInfo: {
    color: "#fff",
    marginLeft: 8,
    opacity: 0.5
  }
});

module.exports = Slideshow;

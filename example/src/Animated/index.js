import React, {Component} from "react";
import {View, Animated} from "react-native";
import {AnimatedSurface} from "gl-react-native";
import GL from "gl-react";

export default class AnimatedExample extends Component {
  state = {
    heightValue: new Animated.Value(200),
  };
  componentWillMount () {
    let i = 0;
    this.interval = setInterval(() =>
      Animated.spring(this.state.heightValue, {
        toValue: ++i % 2 ? 500 : 200,
      }).start(), 1000);
  }
  componentWillUnmount () {
    clearInterval(this.interval);
  }
  render () {
    const { heightValue } = this.state;
    return <View style={{ paddingTop: 60, alignItems: "center" }}>
      <AnimatedSurface
        width={200}
        height={heightValue}>
        <GL.Node shader={{// inline example
            frag: `
precision highp float;
varying vec2 uv;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
            `
          }}
        />
    </AnimatedSurface>
    </View>;
  }
}

import React from "react";
import {Animated} from "react-native";
import GL from "gl-react";
import {Surface} from "gl-react-native";

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;

uniform float value;

void main () {
  gl_FragColor = vec4(uv.x, uv.y, value, 1.0);
}
    `
  }
});

class HelloGL extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      value: new Animated.Value(0)
    };
  }
  componentDidMount () {
    const loop = () => Animated.sequence([
      Animated.timing(this.state.value, { toValue: 1, duration: 1000 }),
      Animated.timing(this.state.value, { toValue: 0, duration: 1000 })
    ]).start(loop);
    loop();
  }
  render () {
    const { width, height } = this.props;
    const { value } = this.state;
    return <Surface width={width} height={height}>
      <GL.Node
        shader={shaders.helloGL}
        uniforms={{ value }}
      />
    </Surface>;
  }
}

module.exports = HelloGL;

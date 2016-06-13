import React, {Component} from "react";
import {View, Animated} from "react-native";
import {Surface} from "gl-react-native";
import GL from "gl-react";

const stateForTime = t => ({
  colors: [
    [ Math.cos(0.002*t), Math.sin(0.002*t), 0.2, 1 ],
    [ Math.sin(0.002*t), -Math.cos(0.002*t), 0.1, 1 ],
    [ 0.3, Math.sin(3+0.002*t), Math.cos(1+0.003*t), 1 ]
  ],
  particles: [
    [ 0.3, 0.3 ],
    [ 0.7, 0.5 ],
    [ 0.4, 0.9 ]
  ]
});

export default class AnimatedExample extends Component {
  state = stateForTime(0);
  componentWillMount () {
    const begin = Date.now();
    this.interval = setInterval(() => this.setState(
      stateForTime(Date.now() - begin)
    ));
  }
  componentWillUnmount () {
    clearInterval(this.interval);
  }
  render () {
    const { colors, particles } = this.state;
    return <View style={{ paddingTop: 60, alignItems: "center" }}>
      <Surface width={300} height={300}>
        <GL.Node
          uniforms={{
            colors,
            particles,
          }}
          shader={{// inline example
            frag: `
precision highp float;
varying vec2 uv;
uniform vec4 colors[3];
uniform vec2 particles[3]; // N.B. don't abuse these technique. it's not meant to be used with lot of objects.
void main () {
  vec4 sum = vec4(0.0);
  for (int i=0; i<3; i++) {
    vec4 c = colors[i];
    vec2 p = particles[i];
    float d = c.a * smoothstep(0.6, 0.2, distance(p, uv));
    sum += d * vec4(c.a * c.rgb, c.a);
  }
  if (sum.a > 1.0) {
    sum.rgb /= sum.a;
    sum.a = 1.0;
  }
  gl_FragColor = vec4(sum.a * sum.rgb, 1.0);
}
            `
          }}
        />
      </Surface>
    </View>;
  }
}

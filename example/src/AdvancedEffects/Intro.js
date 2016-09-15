import React from "react";
import {
  View,
  Text,
} from "react-native";
import GL from "gl-react";
import {Surface} from "gl-react-native";

const shaders = GL.Shaders.create({
  drunkEffect: {
    frag: `
precision highp float;
varying vec2 uv;

uniform float time;
uniform float amp;
uniform float freq;
uniform float colorSeparation;
uniform sampler2D texture;
uniform float moving;

vec2 lookup (vec2 offset) {
  return mod(
    uv + amp * vec2(cos(freq*(uv.x+offset.x)+time),sin(freq*(uv.y+offset.x)+time)) + vec2(moving * time/10.0, 0.0),
    vec2(1.0));
}

void main() {
  gl_FragColor = vec4(
    vec3(
    texture2D(texture, lookup(vec2(colorSeparation))).r,
    texture2D(texture, lookup(vec2(-colorSeparation))).g,
    texture2D(texture, lookup(vec2(0.0))).b),
    1.0);
}
`
  }
});

class Intro extends React.Component {
  render () {
    const { time, fps, width, height } = this.props;
    return <Surface
      width={width}
      height={height}
      onLoad={() => console.log("Intro onLoad")}
      onProgress={e => console.log("Intro onProgress", e.nativeEvent)}>
      <GL.Node
        shader={shaders.drunkEffect}
        uniforms={{
          time: time,
          freq: 20 - 14 * Math.sin(time / 7),
          amp: 0.05 - 0.03 * Math.cos(time / 4),
          colorSeparation: 0.02,
          moving: 1
        }}>
        <GL.Uniform name="texture">
          <View key="root" style={{ flex: 1, justifyContent: "center", backgroundColor: "#111" }}>
            <Text style={{ color: "#00BDF3", fontSize: 32, letterSpacing: -1.0 }}>
              GL REACT NATIVE
            </Text>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <View style={{ backgroundColor: "#00FF66", marginRight: 8, width: 14, height: 14, borderRadius: 7, opacity: time%1 < 0.6 ? 1 : 0 }} />
              <Text style={{ flex: 1, color: "#00FF66", fontSize: 14 }}>
                {time.toFixed(2)}s
              </Text>
              <Text style={{ flex: 1, color: "#fff", fontSize: 14 }}>
                {(fps).toFixed(0)} fps
              </Text>
              <Text style={{ flex: 1, color: "#999", fontSize: 14 }}>
                {"<Text />"}
              </Text>
            </View>
          </View>
        </GL.Uniform>
      </GL.Node>
    </Surface>;
  }
}

module.exports = Intro;

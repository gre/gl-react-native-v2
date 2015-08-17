const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  imageVignette: {
    frag: `
precision highp float;
varying vec2 uv;

uniform float time;
uniform float amp;
uniform float freq;
uniform float colorSeparation;
uniform sampler2D texture;
uniform float moving;

const vec2 center = vec2(0.5);

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
    1.0-min(1.0, pow(1.9 * distance(uv, center), 4.0) + 0.5 * pow(distance(fract(50.0 * uv.y), 0.5), 2.0)));
}
`
  }
});


class Vignette extends React.Component {
  render () {
    const { width, height, time, i, source } = this.props;
    return <GL.View
      shader={shaders.imageVignette}
      style={{ width, height }}
      opaque={false}
      uniforms={{
        time: time,
        freq: (10+i)*(1+Math.sin(0.7*time + i)),
        texture: source,
        amp: 0.02 + Math.max(0, 0.05*i*Math.cos(time + 2*i)),
        colorSeparation: 0.03,
        moving: 0
      }}
    />;
  }
}

module.exports = Vignette;

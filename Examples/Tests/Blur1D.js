const React = require("react-native");
const GL = require("gl-react-native");

const {
  PropTypes
} = React;

const shaders = GL.Shaders.create({
  blur1D: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 resolution;
uniform vec2 direction;
// Credits: https://github.com/Jam3/glsl-fast-gaussian-blur
vec4 blur9 (sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main () {
  gl_FragColor = blur9(t, uv, resolution, direction);
}
    `
  }
});

class Blur1D extends GL.Component {
  render () {
    const { width, height, direction, children } = this.props;
    return <GL.View
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        resolution: [ width, height ]
      }}>
      <GL.Uniform name="t">{children}</GL.Uniform>
    </GL.View>;
  }
}

Blur1D.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  direction: PropTypes.array.isRequired,
  children: PropTypes.any.isRequired
};

module.exports = Blur1D;

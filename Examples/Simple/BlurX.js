const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  blurX: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform float factor;
uniform vec2 resolution;

// from https://github.com/Jam3/glsl-fast-gaussian-blur
vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main () {
  gl_FragColor = blur13(image, uv, resolution, vec2(factor, 0.0));
}
    `
  }
});

class BlurX extends React.Component {
  render () {
    const { width, height, factor, children } = this.props;
    return <GL.View
      shader={shaders.blurX}
      width={width}
      height={height}
      uniforms={{
        factor,
        resolution: [ width, height ]
      }}>
      <GL.Target uniform="image">{children}</GL.Target>
    </GL.View>;
  }
}

module.exports = BlurX;

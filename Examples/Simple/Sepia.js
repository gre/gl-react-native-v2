const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  sepia: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform float factor;

const vec3 sepia = vec3(0.44, 0.26, 0.08);

void main () {
  vec4 c = texture2D(image, uv);
  gl_FragColor = vec4(mix(c.rgb, sepia, factor), c.a);
}
    `
  }
});

class Sepia extends React.Component {
  render () {
    const { width, height, factor, image } = this.props;
    return <GL.View
      shader={shaders.sepia}
      width={width}
      height={height}
      uniforms={{ factor, image }}
    />;
  }
}

module.exports = Sepia;

const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  Premultiply: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main () {
  vec4 c = texture2D(t, uv);
  c.rgb *= c.a;
  gl_FragColor = c;
}
`
  }
});

class Premultiply extends GL.Component {
  render () {
    const { children: t, ...rest } = this.props;
    return <GL.View
      {...rest}
      opaque={false}
      shader={shaders.Premultiply}
      uniforms={{ t }}
    />;
  }
}

module.exports = Premultiply;

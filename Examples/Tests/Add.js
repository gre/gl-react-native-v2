const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  add: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;

void main () {
  vec4 c1 = texture2D(t1, uv);
  vec4 c2 = texture2D(t2, uv);
  gl_FragColor = c1 + c2;
}
`
  }
});

class Add extends GL.Component {
  render () {
    const { width, height, children } = this.props;
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Add");
    const [t1, t2] = children;
    return <GL.View
      shader={shaders.add}
      width={width}
      height={height}
      uniforms={{ t1, t2 }}
    />;
  }
}

module.exports = Add;

const React = require("react-native");
const GL = require("gl-react-native");

class Transition extends React.Component {
  render () {
    const { width, height, shader, progress, from, to, uniforms } = this.props;
    return <GL.View
      shader={shader}
      style={{ width, height }}
      opaque={false}
      uniforms={{
        progress,
        from,
        to,
        ...uniforms
      }}
    />;
  }
}

module.exports = Transition;

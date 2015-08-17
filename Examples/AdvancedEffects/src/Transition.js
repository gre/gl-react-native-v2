const React = require("react-native");
const GL = require("gl-react-native");

class Transition extends React.Component {
  render () {
    const { width, height, shader, progress, from, to, uniforms } = this.props;
    const scale = React.PixelRatio.get();
    return <GL.View
      shader={shader}
      style={{ width, height }}
      opaque={false}
      uniforms={{
        progress,
        from,
        to,
        ...uniforms,
        resolution: [ width * scale, height * scale ]
      }}
    />;
  }
}

module.exports = Transition;

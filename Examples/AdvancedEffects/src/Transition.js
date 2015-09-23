const React = require("react-native");
const GL = require("gl-react-native");

class Transition extends GL.Component {
  render () {
    const { width, height, shader, progress, from, to, uniforms } = this.props;
    const scale = React.PixelRatio.get();
    return <GL.View
      preload
      shader={shader}
      width={width}
      height={height}
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

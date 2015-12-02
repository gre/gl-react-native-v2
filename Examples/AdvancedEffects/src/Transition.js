const React = require("react-native");
const GL = require("gl-react");

module.exports = GL.createComponent(
  ({ width, height, shader, progress, from, to, uniforms }) => {
    const scale = React.PixelRatio.get();
    return <GL.Node
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
  },
  { displayName: "Transition" });

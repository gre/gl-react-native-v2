const React = require("react-native");

const {
  Component,
  requireNativeComponent,
  NativeModules: { RNGLContext }
} = React;

const GLCanvasNative = requireNativeComponent("GLCanvas", GLCanvas);

class GLCanvas extends Component {
  constructor (props) {
    super(props);
  }
  captureFrame (cb) {
    RNGLContext.capture(
      React.findNodeHandle(this.refs.native)
    ).then(
      frame => cb(frame),
      error => console.error(error) // eslint-disable-line no-console
    );
  }
  render () {
    const { width, height, ...restProps } = this.props;
    return <GLCanvasNative
      ref="native"
      {...restProps}
      style={{ width, height }}
    />;
  }
}

module.exports = GLCanvas;

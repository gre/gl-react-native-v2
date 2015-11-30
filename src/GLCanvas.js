const React = require("react-native");

const {
  Component,
  requireNativeComponent,
  NativeModules: { GLCanvasManager }
} = React;

const GLCanvasNative = requireNativeComponent("GLCanvas", GLCanvas);

class GLCanvas extends Component {
  constructor (props) {
    super(props);
  }
  captureFrame (cb) {
    GLCanvasManager.capture(
      React.findNodeHandle(this.refs.native),
      (error, frame) => {
        if (error) console.error(error); // eslint-disable-line no-console
        else cb(frame);
      });
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

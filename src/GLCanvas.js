const React = require("react-native");

const {
  Component,
  requireNativeComponent
} = React;

const GLCanvasNative = requireNativeComponent("GLCanvas", GLCanvas);

class GLCanvas extends Component {
  constructor (props) {
    super(props);
    this.state = {
      captureNextFrameId: 0 // the current id to send to the ObjC part.
    };
    this._captureId = 1; // track the current id to use for captures. it get incremented when the frame is obtained.
    this._captureListeners = { [this._captureId]: [] }; // callbacks by capture id

    this._needsCapture = false;
    this.handleCapture = this.handleCapture.bind(this);
    this.onCaptureFrame = this.onCaptureFrame.bind(this);
  }
  captureFrame (cb) {
    this._captureListeners[this._captureId].push(cb);
    this.requestCapture();
  }
  onCaptureFrame ({ nativeEvent: {frame, id} }) {
    if (id in this._captureListeners) {
      this._captureListeners[id].forEach(listener => listener(frame));
      delete this._captureListeners[id];
    }
    this._captureId ++;
    this._captureListeners[this._captureId] = [];
  }
  requestCapture () {
    if (this._needsCapture) return;
    this._needsCapture = true;
    requestAnimationFrame(this.handleCapture);
  }
  handleCapture () {
    if (!this._needsCapture) return;
    this._needsCapture = false;
    this.setState({ captureNextFrameId: this._captureId });
  }
  render () {
    const { width, height, ...restProps } = this.props;
    const { captureNextFrameId } = this.state;
    return <GLCanvasNative
      ref="native"
      {...restProps}
      style={{ width, height }}
      captureNextFrameId={captureNextFrameId}
      onChange={this.onCaptureFrame} // FIXME using onChange is a current workaround before we migrate to react-native custom callbacks. later, replace with onCaptureNextFrame
    />;
  }
}

module.exports = GLCanvas;

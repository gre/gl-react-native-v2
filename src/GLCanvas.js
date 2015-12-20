const React = require("react-native");
const {
  Component,
  requireNativeComponent
} = React;

const captureFrame = require("./GLCanvas.captureFrame");

const GLCanvasNative = requireNativeComponent("GLCanvas", GLCanvas, {
  nativeOnly: {
    onGLChange: true,
    onGLProgress: true,
    onGLCaptureFrame: true
  }
});

function defer() {
  const deferred = {};
  const promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject  = reject;
  });
  deferred.promise = promise;
  return deferred;
}

class GLCanvas extends Component {
  captureFrame (cb) {
    const promise = (
      this._pendingCaptureFrame || // use pending capture OR create a new captureFrame pending
      (captureFrame(React.findNodeHandle(this.refs.native)), this._pendingCaptureFrame = defer())
    ).promise;
    if (typeof cb === "function") {
      console.warn("GLSurface: callback parameter of captureFrame is deprecated, use the returned promise instead"); // eslint-disable-line no-console
      promise.then(cb);
    }
    return promise;
  }
  onGLCaptureFrame = ({ nativeEvent: {frame} }) => {
    this._pendingCaptureFrame.resolve(frame);
    this._pendingCaptureFrame = undefined;
  }
  render () {
    const { width, height, onLoad, onProgress, eventsThrough, ...restProps } = this.props;
    return <GLCanvasNative
      ref="native"
      {...restProps}
      onGLLoad={onLoad ? onLoad : null}
      onGLProgress={onProgress ? onProgress : null}
      onGLCaptureFrame={this.onGLCaptureFrame}
      pointerEvents={eventsThrough ? "none" : "auto"}
      style={{ width, height }}
    />;
  }
}

module.exports = GLCanvas;

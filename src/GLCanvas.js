import invariant from "invariant";
import React, {Component} from "react";
import {requireNativeComponent, findNodeHandle, processColor} from "react-native";
import captureFrame from "./GLCanvas.captureFrame";

const serializeOption = config =>
config.format + ":" + config.type + ":" + config.quality;

const GLCanvasNative = requireNativeComponent("GLCanvas", GLCanvas, {
  nativeOnly: {
    onGLChange: true,
    onGLProgress: true,
    onGLCaptureFrame: true
  }
});

class GLCanvas extends Component {

  viewConfig = {
    uiViewClassName: "GLCanvas"
  };

  componentWillMount () {
    this._pendingCaptureFrame = {};
  }

  componentWillUnmount () {
    Object.keys(this._pendingCaptureFrame).forEach(key =>
      this._pendingCaptureFrame[key].reject(new Error("GLCanvas is unmounting")));
    this._pendingCaptureFrame = null;
  }

  setNativeProps (props) {
    this.refs.native.setNativeProps(props);
  }

  _addPendingCaptureFrame (config) {
    const key = serializeOption(config);
    return this._pendingCaptureFrame[key] || (
      (captureFrame(findNodeHandle(this.refs.native), config),
      this._pendingCaptureFrame[key] = this._makeDeferred())
    );
  }

  _makeDeferred() {
    var defer = {};
    var p = new Promise(function(resolve, reject) {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    defer.promise = p;
    return defer;
  }

  captureFrame (configArg) {
    let config;
    if (configArg) {
      invariant(typeof configArg==="object", "captureFrame takes an object option in parameter");
      let nb = 0;
      if ("format" in configArg) {
        invariant(
          typeof configArg.format === "string",
          "captureFrame({format}): format must be a string (e.g: 'base64'), Got: '%s'",
          configArg.format);
        if (configArg.format === "file") invariant(
          typeof configArg.filePath === "string" && configArg.filePath,
          "captureFrame({filePath}): filePath must be defined when using 'file' format and be an non-empty string, Got: '%s'",
          configArg.filePath);
        nb ++;
      }
      if ("type" in configArg) {
        invariant(
          typeof configArg.type === "string",
          "captureFrame({type}): type must be a string (e.g: 'png', 'jpg'), Got: '%s'",
          configArg.type);
        nb ++;
      }
      if ("quality" in configArg) {
        invariant(
          typeof configArg.quality === "number" &&
          configArg.quality >= 0 &&
          configArg.quality <= 1,
          "captureFrame({quality}): quality must be a number between 0 and 1, Got: '%s'",
          configArg.quality);
        nb ++;
      }
      if ("filePath" in configArg) {
        nb ++;
      }
      const keys = Object.keys(configArg);
      invariant(keys.length === nb, "captureFrame(config): config must be an object with {format, type, quality, filePath}, found some invalid keys in '%s'", keys);
      config = configArg;
    }
    return this._addPendingCaptureFrame({
      format: "base64",
      type: "png",
      quality: 1,
      filePath: "",
      ...config
    }).promise;
  }

  onGLCaptureFrame = ({ nativeEvent: { error, result, config } }) => {
    const key = serializeOption(config);
    invariant(key in this._pendingCaptureFrame, "capture '%s' is not scheduled in this._pendingCaptureFrame", key);
    if (error) {
      this._pendingCaptureFrame[key].reject(error);
    }
    else {
      this._pendingCaptureFrame[key].resolve(result);
    }
    delete this._pendingCaptureFrame[key];
  };

  render () {
    const {
      width, height, style,
      onLoad, onProgress, eventsThrough,
      ...restProps } = this.props;
    const { backgroundColor } = style;

    return <GLCanvasNative
      ref="native"
      {...restProps}
      backgroundColor={processColor(backgroundColor)}
      style={{ width, height }}
      onGLLoad={onLoad ? onLoad : null}
      onGLProgress={onProgress ? onProgress : null}
      onGLCaptureFrame={this.onGLCaptureFrame}
      pointerEvents={eventsThrough ? "none" : "auto"}
    />;
  }
}

module.exports = GLCanvas;

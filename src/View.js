const {createView} = require("gl-react-core");
const React = require("react-native");
const Shaders = require("./Shaders");
const Target = require("./Target");
const Component = require("./Component");

const {
  requireNativeComponent,
  View,
} = React;

const GLCanvas = requireNativeComponent("GLCanvas", null);

const renderVtarget = function (style, width, height, id, children) {
  const childrenStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    overflow: "hidden"
  };
  return <View style={[ childrenStyle, style ]}>{children}</View>;
};

const renderVGL = function (props, width, height, data, nbTargets, renderId) {
  return <GLCanvas
    ref="native"
    {...props}
    style={{ ...props.style, width, height }}
    data={data}
    nbTargets={nbTargets}
    renderId={renderId}
  />;
};

const renderVcontainer = function (style, width, height, targets, renderer) {
  if (targets) {
    const parentStyle = {
      ...style,
      position: "relative",
      width: width,
      height: height,
      overflow: "hidden"
    };
    return <View style={parentStyle}>
      {targets}
      {renderer}
    </View>;
  }
  else {
    return renderer;
  }
};

const GLView = createView(React, Shaders, Target, Component, renderVcontainer, renderVtarget, renderVGL);

GLView.prototype.setNativeProps = function (props) {
  this.refs.native.setNativeProps(props);
};

module.exports = GLView;

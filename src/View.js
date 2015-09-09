const {createView} = require("gl-react-core");
const React = require("react-native");
const Shaders = require("./Shaders");
const Uniform = require("./Uniform");
const Component = require("./Component");

const {
  requireNativeComponent,
  View,
} = React;

const GLCanvas = requireNativeComponent("GLCanvas", null);

const renderVcontent = function (width, height, id, children) {
  const childrenStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    overflow: "hidden"
  };
  return <View key={id} style={childrenStyle}>{children}</View>;
};

const renderVGL = function (props) {
  const { width, height, ...restProps } = props;
  return <GLCanvas
    key="native"
    {...restProps}
    style={{ width, height }}
  />;
};

const renderVcontainer = function (width, height, contents, renderer) {
  const parentStyle = {
    position: "relative",
    width: width,
    height: height,
    overflow: "hidden"
  };
  return <View style={parentStyle}>
    {contents}
    {renderer}
  </View>;
};

const GLView = createView(React, Shaders, Uniform, Component, renderVcontainer, renderVcontent, renderVGL);

GLView.prototype.setNativeProps = function (props) {
  this.refs.native.setNativeProps(props);
};

module.exports = GLView;

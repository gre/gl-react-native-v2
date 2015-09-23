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

const renderVcontent = function (width, height, id, children, visibleContent) {
  const childrenStyle = {
    position: "absolute",
    top: visibleContent ? 0 : height,
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

const renderVcontainer = function (width, height, contents, renderer, style) {
  const parentStyle = {
    position: "relative",
    ...style,
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

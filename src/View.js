const {createView} = require("gl-react-core");
const React = require("react-native");
const Shaders = require("./Shaders");
const Uniform = require("./Uniform");
const GLCanvas = require("./GLCanvas");

const {
  View,
} = React;

const renderVcontent = function (width, height, id, children, { visibleContent }) {
  const childrenStyle = {
    position: "absolute",
    top: visibleContent ? 0 : height, // as a workaround for RN, we offset the content so it is not visible but still can be rasterized
    left: 0,
    width: width,
    height: height,
    overflow: "hidden"
  };
  return <View key={id} style={childrenStyle}>{children}</View>;
};

const renderVGL = function (props) {
  return <GLCanvas ref="canvas" {...props} />;
};

const renderVcontainer = function ({ style, width, height }, contents, renderer) {
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

const GLView = createView(React, Shaders, Uniform, renderVcontainer, renderVcontent, renderVGL);

GLView.prototype.setNativeProps = function (props) {
  this.refs.native.setNativeProps(props);
};

module.exports = GLView;

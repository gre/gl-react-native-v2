const {createSurface} = require("gl-react");
const React = require("react-native");
const GLCanvas = require("./GLCanvas");

const {
  View,
} = React;

function renderVcontent (width, height, id, children, { visibleContent }) {
  const childrenStyle = {
    position: "absolute",
    top: visibleContent ? 0 : height, // as a workaround for RN, we offset the content so it is not visible but still can be rasterized
    left: 0,
    width: width,
    height: height,
    overflow: "hidden"
  };
  return <View key={id} style={childrenStyle}>{children}</View>;
}

function renderVGL (props) {
  return <GLCanvas ref="canvas" {...props} />;
}

function renderVcontainer ({ style, width, height }, contents, renderer) {
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
}

module.exports = createSurface(renderVcontainer, renderVcontent, renderVGL);

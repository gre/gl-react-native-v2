import invariant from "invariant";
import {createSurface} from "gl-react";
import React, {
  View,
  PixelRatio
} from "react-native";
import GLCanvas from "./GLCanvas";

invariant(typeof createSurface === "function",
"gl-react createSurface is not a function. Check your gl-react dependency");

const getPixelRatio = props => props.scale || PixelRatio.get();

function renderVcontent (width, height, id, children, { visibleContent }) {
  const childrenStyle = {
    position: "absolute",
    top: visibleContent ? 0 : height, // as a workaround for RN, we offset the content so it is not visible but still can be rasterized
    left: 0,
    width: width,
    height: height,
    overflow: "hidden",
  };
  return <View key={id} style={childrenStyle}>{children}</View>;
}

function renderVGL (props) {
  return <GLCanvas ref="canvas" {...props} />;
}

function renderVcontainer ({ style, width, height, visibleContent, eventsThrough }, contents, renderer) {
  const parentStyle = [
    {
      position: "relative",
    },
    style,
    {
      width: width,
      height: height,
      overflow: "hidden",
    }
  ];
  return <View
    pointerEvents={!visibleContent && eventsThrough ? "none" : "auto"}
    style={parentStyle}>
    {contents}
    {renderer}
  </View>;
}

module.exports = createSurface(
  renderVcontainer,
  renderVcontent,
  renderVGL,
  getPixelRatio);

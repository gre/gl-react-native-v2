import invariant from "invariant";
import {createSurface} from "gl-react";
import React from "react";
import {PixelRatio} from "react-native";

invariant(typeof createSurface === "function",
"gl-react createSurface is not a function. Check your gl-react dependency");

const getPixelRatio = props => props.scale || PixelRatio.get();

export default C => {
  const renderVcontainer = ({ style, width, height, visibleContent, eventsThrough }, contents, renderer) => {
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
    return <C.View
      pointerEvents={!visibleContent && eventsThrough ? "none" : "auto"}
      style={parentStyle}>
      {contents}
      {renderer}
    </C.View>;
  };
  const renderVcontent = (width, height, id, children, { visibleContent }) => {
    const childrenStyle = {
      position: "absolute",
      top: visibleContent ? 0 : height, // as a workaround for RN, we offset the content so it is not visible but still can be rasterized
      left: 0,
      width: width,
      height: height,
      overflow: "hidden",
    };
    return <C.View key={id} style={childrenStyle}>{children}</C.View>;
  };
  const renderVGL = props => {
    C.dimensionInvariant(props.width, "width");
    C.dimensionInvariant(props.height, "height");
    return <C.GLCanvas ref="canvas" {...props} />;
  };

  return createSurface(
    renderVcontainer,
    renderVcontent,
    renderVGL,
    getPixelRatio,
    C.getGLCanvas,
  );
};

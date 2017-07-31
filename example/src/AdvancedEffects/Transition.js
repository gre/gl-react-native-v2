import { PixelRatio } from "react-native";
import React from "react";
import GL from "gl-react";

module.exports = GL.createComponent(
  ({ width, height, shader, progress, from, to, uniforms }) => {
    const scale = PixelRatio.get();
    return (
      <GL.Node
        preload
        shader={shader}
        width={width}
        height={height}
        backgroundColor="transparent"
        setZOrderOnTop
        uniforms={{
          progress,
          from,
          to,
          ...uniforms,
          resolution: [width * scale, height * scale]
        }}
      />
    );
  },
  { displayName: "Transition" }
);

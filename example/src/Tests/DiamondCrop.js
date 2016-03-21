import GL from "gl-react";
import React from "react";

const shaders = GL.Shaders.create({
  DiamondCrop: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  gl_FragColor = mix(
    texture2D(t, uv),
    vec4(0.0),
    step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5))
  );
}
`
  }
});

module.exports = GL.createComponent(
  ({ children: t }) =>
  <GL.Node
    shader={shaders.DiamondCrop}
    uniforms={{ t }}
  />,
{ displayName: "DiamondCrop" }
);

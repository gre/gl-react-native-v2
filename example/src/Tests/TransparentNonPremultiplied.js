import GL from "gl-react";
import React from "react";

const shaders = GL.Shaders.create({
  TransparentNonPremultiplied: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main () {
  gl_FragColor = vec4(texture2D(t, uv).rgb, 0.0);
}
`
  }
});

module.exports = GL.createComponent(
  ({ children: t, ...rest }) =>
  <GL.Node
    {...rest}
    backgroundColor="transparent"
    shader={shaders.TransparentNonPremultiplied}
    uniforms={{ t }}
  />,
{ displayName: "TransparentNonPremultiplied" });

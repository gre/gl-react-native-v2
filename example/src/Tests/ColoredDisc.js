import GL from "gl-react";
import React from "react";

const shaders = GL.Shaders.create({
  ColoredDisc: {
    frag: `
precision highp float;
varying vec2 uv;
uniform vec3 fromColor;
uniform vec3 toColor;
void main () {
  float d = 2.0 * distance(uv, vec2(0.5));
  gl_FragColor = mix(
    vec4(mix(fromColor, toColor, d), 1.0),
    vec4(0.0),
    step(1.0, d)
  );
}
`
  }
});

module.exports = GL.createComponent(
  ({ fromColor, toColor }) =>
  <GL.Node
    shader={shaders.ColoredDisc}
    uniforms={{ fromColor, toColor }}
  />,
  { displayName: "ColoredDisc" }
);

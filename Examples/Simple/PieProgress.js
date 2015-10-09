const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  pieProgress: {
    frag: `
precision mediump float;
varying vec2 uv;

uniform vec4 colorInside, colorOutside;
uniform float radius;
uniform float progress;
uniform vec2 dim;

const vec2 center = vec2(0.5);
const float PI = acos(-1.0);

void main () {
  vec2 norm = dim / min(dim.x, dim.y);
  vec2 p = uv * norm - (norm-1.0)/2.0;
  vec2 delta = p - center;
  float inside =
    step(length(delta), radius) *
    step((PI + atan(delta.y, -delta.x)) / (2.0 * PI), progress);
  gl_FragColor = mix(
    colorOutside,
    colorInside,
    inside
  );
}
    `
  }
});

module.exports = GL.createComponent(
  ({
    width,
    height,
    progress,
    colorInside,
    colorOutside,
    radius
  }) =>
  <GL.View
    width={width}
    height={height}
    shader={shaders.pieProgress}
    opaque={false}
    uniforms={{
      dim: [ width, height ],
      progress,
      colorInside,
      colorOutside,
      radius
    }}
  />,
  {
    displayName: "PieProgress",
    defaultProps: {
      colorInside: [0, 0, 0, 0],
      colorOutside: [0, 0, 0, 0.5],
      radius: 0.4
    }
  });

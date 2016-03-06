import GL from "gl-react";
import React, {PropTypes} from "react";

const shaders = GL.Shaders.create({
  Heart: { // inspired from http://glslsandbox.com/e#29521.0
    frag: `
precision highp float;
varying vec2 uv;
uniform vec3 color;

void main(void)
{
  vec2 p = (2.0 * uv - 1.0);
  p -= vec2(0.,0.3);
  p *= vec2(0.5,1.5) + 0.8*vec2(0.5,-0.5);

  float a = atan(p.x,p.y)/3.141593;
  float r = length(p);

  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);

  float f = step(r,d) * pow(1.0-r/d,0.25);
  gl_FragColor = vec4(mix(vec3(0.0), color, f), 1.0);
}
    `
  }
});

module.exports = GL.createComponent(
  ({ color }) => <GL.Node shader={shaders.Heart} uniforms={{ color }} />,
  {
    displayName: "Heart",
    propTypes: {
      color: PropTypes.array.isRequired
    }
  });

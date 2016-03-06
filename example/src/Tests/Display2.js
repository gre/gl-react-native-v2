import GL from "gl-react";
import React from "react";

const shaders = GL.Shaders.create({
  display2: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;
uniform bool vertical;

void main () {
  float v = vertical ? 1.0 : 0.0;
  vec2 p = uv * mix(vec2(2.0, 1.0), vec2(1.0, 2.0), v);
  vec4 c1 = step(mix(p.x, p.y, v), 1.0) * texture2D(t1, p);
  vec4 c2 = step(1.0, mix(p.x, p.y, v)) * texture2D(t2, p - vec2(1.0-v, v));
  gl_FragColor = c1 + c2;
}
`
  }
});

module.exports = GL.createComponent(
  ({ width, height, children, vertical, ...rest }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Display2");
    let [t1, t2] = children;
    if (vertical) [t1,t2]=[t2,t1]; // just because webgl y's is reversed
    return <GL.Node
      {...rest}
      shader={shaders.display2}
      width={width}
      height={height}
      uniforms={{ t1, t2, vertical: !!vertical }}
      debug={true}
    />;
  },
  {
    displayName: "Display2"
  }
);

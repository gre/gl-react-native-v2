import GL from "gl-react";
import React from "react";

const shaders = GL.Shaders.create({
  layer: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;

void main () {
  vec4 c1 = texture2D(t1, uv);
  vec4 c2 = texture2D(t2, uv);
  gl_FragColor = vec4(mix(c1.rgb, c2.rgb, c2.a), c1.a + c2.a);
}
`
  }
});

module.exports = GL.createComponent(
  ({ children, ...rest }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Layer");
    const [t1, t2] = children;
    return <GL.Node
      {...rest}
      shader={shaders.layer}
      uniforms={{ t1, t2 }}
    />;
  },
  {
    displayName: "Layer"
  }
);

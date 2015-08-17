const React = require("react-native");
const GL = require("gl-react-native");
const Transition = require("./Transition");

const shaders = GL.Shaders.create({
  transitionDirectionalWipe: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 direction;
uniform float smoothness;

const vec2 center = vec2(0.5, 0.5);

void main() {
  vec2 v = normalize(direction);
  v /= abs(v.x)+abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float m = smoothstep(-smoothness, 0.0, v.x * uv.x + v.y * uv.y - (d-0.5+progress*(1.+smoothness)));
  gl_FragColor = mix(texture2D(to, uv), texture2D(from, uv), m);
}
`
  },
  transitionRandomSquares: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform ivec2 size;
uniform float smoothness;
float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
  float r = rand(floor(vec2(size) * uv));
  float m = smoothstep(0.0, -smoothness, r - (progress * (1.0 + smoothness)));
  gl_FragColor = mix(texture2D(from, uv), texture2D(to, uv), m);
}
    `
  },
  transitionWind: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
uniform float size;
float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
  float r = rand(vec2(0, uv.y));
  float m = smoothstep(0.0, -size, uv.x*(1.0-size) + size*r - (progress * (1.0 + size)));
  gl_FragColor = mix(texture2D(from, uv), texture2D(to, uv), m);
}
`
  }
});

class Slideshow extends React.Component {
  render () {
    const { duration, width, height, time, images } = this.props;
    const slide = time / duration;
    let transitionProgress = slide % 1;
    let transitionFrom = images[Math.floor(slide) % images.length];
    let transitionTo = images[Math.floor(slide+1) % images.length];

    let transitionShader, transitionUniforms;
    switch (Math.floor(slide/4) % 3) {
    case 0:
      transitionShader = shaders.transitionRandomSquares;
      const w = 3 * (1 + Math.floor(slide % 8));
      transitionUniforms = {
        size: [w, w * 2 / 3],
        smoothness: 0.5
      };
      break;
    case 1:
      transitionShader = shaders.transitionDirectionalWipe;
      transitionUniforms = {
        direction: [Math.cos(time/2), Math.sin(time/2)],
        smoothness: 0.5
      };
      break;
    case 2:
      transitionShader = shaders.transitionWind;
      transitionUniforms = {
        size: 0.2
      };
      break;
    }

    return <Transition
      width={width}
      height={height}
      progress={transitionProgress}
      from={transitionFrom}
      to={transitionTo}
      shader={transitionShader}
      uniforms={transitionUniforms}
    />;
  }
}

module.exports = Slideshow;

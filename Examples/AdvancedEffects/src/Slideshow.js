const React = require("react-native");
const GL = require("gl-react-native");
const TransitionGenerator = require("./TransitionGenerator");
const Transition = require("./Transition");

const shaders = GL.Shaders.create(TransitionGenerator.shaders);

class Slideshow extends React.Component {
  constructor (props) {
    super(props);
    this._currentTransition = -1;
  }
  render () {
    const { duration, width, height, time, images } = this.props;
    const slide = time / duration;
    let transitionProgress = slide % 1;
    let transitionFrom = images[Math.floor(slide) % images.length];
    let transitionTo = images[Math.floor(slide+1) % images.length];

    const currentTransition = Math.floor(slide);
    if (currentTransition !== this._currentTransition) {
      this._currentTransition = currentTransition;
      const { name, uniforms } = TransitionGenerator.random();
      this._shader = shaders[name];
      this._uniforms = uniforms;
    }

    const transitionShader = this._shader;
    const transitionUniforms = this._uniforms;

    /*
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
    */

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

const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  pieProgress: {
    frag: `
precision mediump float;
varying vec2 uv;

uniform float pressed;
uniform vec2 position;

void main () {
  float dist = pow(1.0 - distance(position, uv), 4.0);
  float edgeDistX = pow(1.0 - distance(position.x, uv.x), 24.0);
  float edgeDistY = pow(1.0 - distance(position.y, uv.y), 24.0);
  gl_FragColor = pressed * vec4(0.8 * dist + edgeDistX, 0.7 * dist + edgeDistY, 0.6 * dist, 1.0);
}
    `
  }
});

class PieProgress extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      pressed: 0,
      position: [ 0, 0 ]
    };
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
  }
  onTouchStart (evt) {
    this.setState({
      pressed: 1
    });
    this.onTouchMove(evt);
  }
  onTouchMove (evt) {
    const { width, height } = this.props;
    const { locationX, locationY } = evt.nativeEvent;
    this.setState({
      position: [
        Math.max(0, Math.min(locationX/width, 1)),
        Math.max(0, Math.min(1-locationY/height, 1))
      ]
    });
  }
  onTouchEnd () {
    this.setState({
      pressed: 0
    });
  }
  render () {
    const { width, height } = this.props;
    const { pressed, position } = this.state;
    return <GL.View
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponderCapture={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={this.onTouchStart}
      onResponderMove={this.onTouchMove}
      onResponderRelease={this.onTouchEnd}
      onResponderTerminate={this.onTouchEnd}
      width={width}
      height={height}
      shader={shaders.pieProgress}
      uniforms={{ pressed, position }}
    />;
  }
}

module.exports = PieProgress;

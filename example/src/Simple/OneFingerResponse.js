import React from "react";
import {PanResponder, UIManager, findNodeHandle} from "react-native";
import GL from "gl-react";
import {Surface} from "gl-react-native";

const shaders = GL.Shaders.create({
  oneFingerResponse: {
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

class OneFingerResponse extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      pressed: 0,
      position: [ 0, 0 ],
      surfaceBound: [ 0, 0, 1, 1 ] // x, y, w, h
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) =>
        UIManager.measure(
          findNodeHandle(this.refs.surface),
          (a, b, w, h, x, y) =>
            this.setState({
              pressed: 1,
              surfaceBound: [x,y,w,h],
              position: [ gestureState.x0, gestureState.y0 ]
            })),

      onPanResponderMove: (evt, gestureState) =>
        this.setState({
          position: [ gestureState.x0 + gestureState.dx, gestureState.y0 + gestureState.dy ]
        }),

      onPanResponderTerminationRequest: (evt, gestureState) => true,

      onPanResponderRelease: (evt, gestureState) =>
        this.setState({
          pressed: 0
        }),

      onPanResponderTerminate: (evt, gestureState) =>
        this.setState({
          pressed: 0
        }),

      onShouldBlockNativeResponder: (evt, gestureState) => true
    });

  }
  render () {
    const { width, height } = this.props;
    const { pressed, position:[x,y], surfaceBound: [sx,sy,sw,sh] } = this.state;
    const position = [
      (x - sx) / sw,
      1 - (y - sy) / sh
    ];
    return <Surface
      ref="surface"
      style={{ backgroundColor: "#000" }}
      {...this._panResponder.panHandlers}
      width={width}
      height={height}>
      <GL.Node
        shader={shaders.oneFingerResponse}
        uniforms={{ pressed, position }}
      />
    </Surface>;
  }
}

module.exports = OneFingerResponse;

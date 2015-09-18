const React = require("react-native");
const GL = require("gl-react-native");
const Blur1D = require("./Blur1D");

class Blur extends GL.Component {
  render () {
    const { width, height, factor, children, ...rest } = this.props;
    return <Blur1D {...rest} width={width} height={height} direction={[ factor, 0 ]}>
      <Blur1D width={width} height={height} direction={[ 0, factor ]}>
        {children}
      </Blur1D>
    </Blur1D>;
  }
}

module.exports = Blur;

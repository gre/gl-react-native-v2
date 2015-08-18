const invariant = require("invariant");
const React = require("react-native");
const {
  NativeModules: { GLShadersRegistry },
  requireNativeComponent,
  Component,
  PropTypes,
  View,
} = React;

let _uid = 1;

const Shaders = {
  create: function (obj) {
    invariant(typeof obj === "object", "config must be an object");
    const result = {};
    for (let key in obj) {
      const shader = obj[key];
      invariant(typeof shader === "object" && typeof shader.frag === "string",
      "invalid shader given to Shaders.create(). A valid shader is a { frag: String }");
      const id = _uid ++;
      GLShadersRegistry.register(id, shader, key);
      result[key] = id;
    }
    return result;
  },
  exists: function (id) {
    return typeof id === "number" && id >= 1 && id < _uid;
  }
};

class Target extends Component {
  render () {
    invariant(
      false,
      "GL.Target elements are for GL.View configuration only and should not be rendered"
    );
  }
}
Target.displayName = "GL.Target";
Target.propTypes = {
  children: PropTypes.any.isRequired,
  uniform: PropTypes.string.isRequired
};

const GLViewNative = requireNativeComponent("GLView", GLView);
class GLView extends Component {

  constructor (props, context) {
    super(props, context);
    this._targetIncrement = 0; // This is a current workaround to force the refresh of targets
  }

  setNativeProps (props) {
    this.refs.native.setNativeProps(props);
  }

  render() {
    const props = this.props;
    const { style, width, height, children, shader } = props;

    invariant(Shaders.exists(shader), "Shader #%s does not exists", shader);

    const nativeStyle = {
      width: width,
      height: height,
      ...style
    };

    if (children) {
      const parentStyle = {
        position: "relative",
        width: width,
        height: height,
        overflow: "hidden"
      };
      const childrenStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height
      };

      const targetUniforms = [];
      const targets = React.Children.map(children, child => {
        invariant(child.type === Target, "GL.View can only contains children of type GL.Target. Got '%s'", child.type && child.type.displayName || child);
        const uniform = child.props.uniform;
        targetUniforms.push(uniform);
        return <View style={[ childrenStyle, child.props.style ]}>{child.props.children}</View>;
      });
      return <View style={parentStyle}>
        {targets}
        <GLViewNative
          ref="native"
          {...props}
          style={nativeStyle}
          children={undefined}
          targetUniforms={targetUniforms}
          targetIncrement={this._targetIncrement++} />
      </View>;
    }
    else {
      return <GLViewNative ref="native" {...props} style={nativeStyle} />;
    }
  }
}
GLView.displayName = "GL.View";
GLView.propTypes = {
  shader: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  uniforms: PropTypes.object,
  childrenUniform: PropTypes.string,
  opaque: PropTypes.bool
};
GLView.defaultProps = {
  opaque: true
};

module.exports = {
  View: GLView,
  Target,
  Shaders
};

# gl-react-native

OpenGL bindings for react-native to implement complex effects over images and components, in the descriptive VDOM paradigm.

More technically, `gl-react-native` allows you to write a [fragment shader](https://www.opengl.org/wiki/Fragment_Shader) that covers a View. The shader can render: generated graphics/demos, effects on top of images, effects over any UI content... anything you can imagine!

**There's also a React version [`gl-react`](http://github.com/ProjectSeptemberInc/gl-react) with the same API.**

[![](docs/examples/simple.gif)](./Examples/Simple)[![](docs/examples/advancedeffects.gif)](./Examples/AdvancedEffects)

### HelloGL Gist

```js
const React = require("react-native");
const GL = require("gl-react-native");

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`
  }
});

class HelloGL extends React.Component {
  render () {
    const { width, height } = this.props;
    return <GL.View
      shader={shaders.helloGL}
      width={width}
      height={height}
    />;
  }
}
```

![](docs/examples/1.jpg)

## Focus

- **Virtual DOM and immutable** paradigm: OpenGL is a low level imperative and mutable API. This library takes the best of it and exposes it in an immutable, descriptive way.
- **Performance**
- **Developer experience**: the application doesn't crash on bugs - it uses React Native error message to display GLSL errors, with Live Reload support to make experimenting with effects easy.
- **Uniform bindings**: bindings from JavaScript objects to OpenGL GLSL language types (bool, int, float, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D...)
- **Support for images** as a texture uniform.
- **Support for UIView rasterisation** as a texture uniform.

## Installation

a few steps are required to install `gl-react-native`:

**Install the dependency to your React Native application:**

```
npm i --save gl-react-native
```

**Configure your React Native Application:**

![](docs/install-steps.png)


## Influence / Credits

- [stack.gl](http://stack.gl/) approach
- [GLSL.io](http://glsl.io/) and [Diaporama](https://github.com/gre/diaporama)
- Source code of [React Native](https://github.com/facebook/react-native)

## Documentation

[**Gitbook**](http://projectseptemberinc.gitbooks.io/gl-react-native/content/)

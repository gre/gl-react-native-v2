# gl-react-native

`gl-react-native` implements OpenGL bindings for react-native.

It lets you implement complex effects over images and components, in the Virtual DOM descriptive paradigm.

More technically, `gl-react-native` allows you to write a [fragment shader](https://www.opengl.org/wiki/Fragment_Shader) that covers a View. The shader can render: generated graphics/demos, effects on top of images, effects over any UI content... anything you can imagine!

There's also a React version [`gl-react`](http://github.com/ProjectSeptemberInc/gl-react) with the same API.

[![](docs/examples/simple.gif)](./Examples/Simple)[![](docs/examples/advancedeffects.gif)](./Examples/AdvancedEffects)

## Focus

- **Virtual DOM and immutable** paradigm: OpenGL is a low level imperative and mutable API. This library takes the best of it and exposes it in an immutable, descriptive way.
- **Performance**
- **Developer experience**: the application doesn't crash on bugs - it uses React Native error message to display GLSL errors, with Live Reload support to make experimenting with effects easy.
- **Uniform bindings**: bindings from JavaScript objects to OpenGL GLSL language types (bool, int, float, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D...)
- **Support for images** as a texture uniform.
- **Support for UIView rasterisation** as a texture uniform.


## Installation

a few steps are required to install `gl-react-native`:

**Install the dependency from your React Native application:**

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

![Index](./docs)

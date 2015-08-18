# gl-react-native

`gl-react-native` implements OpenGL bindings for react-native.

It lets you implement complex effects on top of images and components
and in the Virtual DOM descriptive paradigm.

More technically, `gl-react-native` allows you to write a fragment shader that covers a View. This shader can render: some graphics/demos, any effects over images, any effects over any UI content.

A React version also exists: [`gl-react`](http://github.com/ProjectSeptemberInc/gl-react).

## Focus

- **Virtual DOM and immutable** paradigm: OpenGL is a low level imperative and mutable API. This library takes the best of it to expose it in a immutable and descriptive way.
- **Performance**
- **Developer experience**: the application does not crash if developer make mistakes, it uses React Native error message to display GLSL errors and help him developing the effects with Live Reload support.
- **Uniform bindings**: The library implements binding from the JavaScript objects to the OpenGL GLSL language types (bool, int, float, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D...)
- **Support for images** as texture uniform.
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

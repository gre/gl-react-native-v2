# GL.Target

`GL.Target` allows to render a shader with any content (any React Native component rasterized as a uniform texture).

> **N.B.** This feature is advanced and experimental. It current does not yet support subviews content refreshing (like Image load event,...).

**Example:**

```js
render () {
  return <GL.View shader={shaders.myEffect3}
    width={200} height={100}>

    <GL.Target uniform="textureName">
    ...any React Native components
    </GL.Target>

  </GL.View>;
}
```

## Props

- **`uniform`** *string* **(required)**: The name of the shader texture uniform to use for rendering the content.

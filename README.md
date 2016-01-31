**[Gitbook documentation](http://projectseptemberinc.gitbooks.io/gl-react/content/) / [Github](https://github.com/ProjectSeptemberInc/gl-react-native/) / [gl-react](https://github.com/ProjectSeptemberInc/gl-react/)** / [#gl-react on reactiflux](https://discordapp.com/channels/102860784329052160/106102146109325312)

# <img width="32" alt="icon" src="https://cloud.githubusercontent.com/assets/211411/9813786/eacfcc24-5888-11e5-8f9b-5a907a2cbb21.png"> gl-react-native ![](https://img.shields.io/badge/react--native-%200.19.x-05F561.svg) ![](https://img.shields.io/badge/gl--react-%202.1.x-05F561.svg)

OpenGL bindings for React Native to implement complex effects over images and components, in the descriptive VDOM paradigm.

**`gl-react-native` is an implementation of `gl-react` for `react-native`. Please [read the main gl-react README](https://github.com/ProjectSeptemberInc/gl-react/) for more information.**

[![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/simple.gif)](./Examples/Simple)[![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/advancedeffects.gif)](./Examples/AdvancedEffects)

## Documentation

[**Gitbook**](http://projectseptemberinc.gitbooks.io/gl-react/content/)

## Installation

```
npm i --save gl-react-native
```

### Configure your React Native Application

**on iOS:**

![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/install-steps.png)

**on Android:**

1. `android/settings.gradle`:: Add the following snippet
```gradle
include ':RNGL'
project(':RNGL').projectDir = file('../node_modules/gl-react-native/android')
```
1. `android/app/build.gradle`: Add in dependencies block.
```gradle
compile project(':RNGL')
```
1. in your `MainActivity` (or equivalent):
```java
import com.projectseptember.RNGL.RNGLPackage;
...

mReactInstanceManager = ReactInstanceManager.builder()
    .setApplication(getApplication())
    ...
    .addPackage(new MainReactPackage())
    .addPackage(new RNGLPackage())
    ...
    .build();

```

**This repository hosts the v2 of gl-react. Please also see the v3 at https://github.com/gre/gl-react**


**[Gitbook documentation](https://github.com/ProjectSeptemberInc/gl-react/tree/master/docs) / [Github](https://github.com/ProjectSeptemberInc/gl-react-native/) / [gl-react](https://github.com/ProjectSeptemberInc/gl-react/)** / [#gl-react on reactiflux](https://discordapp.com/channels/102860784329052160/106102146109325312)

# <img width="32" alt="icon" src="https://cloud.githubusercontent.com/assets/211411/9813786/eacfcc24-5888-11e5-8f9b-5a907a2cbb21.png"> gl-react-native ![](https://img.shields.io/badge/react--native-%200.42.x-05F561.svg) ![](https://img.shields.io/badge/gl--react-%202.2.x-05F561.svg)

OpenGL bindings for React Native to implement complex effects over images and components, in the descriptive VDOM paradigm.

**`gl-react-native` is an implementation of `gl-react` for `react-native`. Please [read the main gl-react README](https://github.com/ProjectSeptemberInc/gl-react/) for more information.**

[![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/simple.gif)](./example)[![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/advancedeffects.gif)](./example)

## Documentation

[**doc**](https://github.com/ProjectSeptemberInc/gl-react/tree/master/docs)

## Installation

```
npm i --save gl-react-native
```

### Configure your React Native Application

**on iOS:**

![](https://github.com/ProjectSeptemberInc/gl-react-native/raw/master/docs/install-steps.png)

or if you use Cocapods:

```ruby
pod 'RNGL', :path => './node_modules/gl-react-native'
```

**on Android:**

1. `android/settings.gradle`:: Add the following snippet
```gradle
include ':RNGL'
project(':RNGL').projectDir = file('../node_modules/gl-react-native/android')
```
2. `android/app/build.gradle`: Add in dependencies block.
```gradle
compile project(':RNGL')
```
3. in your `MainApplication` (or equivalent) the RNGLPackage needs to be added. Add the import at the top:
```java
import com.projectseptember.RNGL.RNGLPackage;
```
4. In order for React Native to use the package, add it the packages inside of the class extending ReactActivity.
```java
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
	new MainReactPackage(),
	...
	new RNGLPackage()
  );
}
```

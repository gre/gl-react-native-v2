const React = require("react-native");
const {
  AppRegistry,
  Text,
  View,
  ScrollView,
  Image,
} = React;

const Blur = require("./Blur");
const Add = require("./Add");
const Multiply = require("./Multiply");
const Layer = require("./Layer");
const NativeLayer = require("./NativeLayer");
const HelloGL = require("./HelloGL");
const Display2 = require("./Display2");
const Copy = require("./Copy");
const TransparentNonPremultiplied = require("./TransparentNonPremultiplied");
const { width: viewportW, height: viewportH } = require("Dimensions").get("window");

class Tests extends React.Component {

  constructor (props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.onProgress = this.onProgress.bind(this);
  }
  onLoad () {
    console.log("LOADED");
  }
  onProgress ({nativeEvent: { progress, loaded, total }}) {
    console.log("PROGRESS", progress, loaded, total);
  }
  render () {

    const debugSize = viewportW / 2;

    const helloGL =
      <HelloGL width={64} height={64} />;

    const txt =
      <View style={{ width: 800, height: 800, position: "relative", backgroundColor: "transparent" }}>
        {[0,1,2,3].map(i => <Text style={{
          position: "absolute",
          top: 40+200*i,
          left: 0,
          width: 800,
          height: 200,
          textAlign: "center",
          color: ["#f00", "#0f0", "#00f", "#fff"][i],
          fontSize: 80
        }}>
          Hello World {i}
        </Text>)}
      </View>;

    const img = "http://i.imgur.com/zJIxPEo.jpg?t="+Date.now();

    const blurredImage =
      <Blur factor={4} passes={6} width={200} height={200}>
        {img}
      </Blur>;

    const blurredImageOverText =
      <Layer>
        {blurredImage}
        {txt}
      </Layer>;

    return <ScrollView style={{ backgroundColor: "#000" }}>
      <Display2 width={viewportW} height={viewportW} preload onLoad={this.onLoad} onProgress={this.onProgress}>
        <Add width={viewportW/2} height={viewportH/2}>
          {txt}
          {helloGL}
        </Add>
        <Display2 width={viewportW/2} height={viewportH/2} vertical>
          <Blur factor={1} passes={4} width={viewportW/2} height={viewportH/4}>
            <Multiply>
              {blurredImageOverText}
              {helloGL}
            </Multiply>
          </Blur>
          {blurredImage}
        </Display2>
      </Display2>


      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false}>
            http://i.imgur.com/mp79p5T.png
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false}>
            <Copy>
              http://i.imgur.com/mp79p5T.png
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false}>
            <Copy>
              <Copy>
                http://i.imgur.com/mp79p5T.png
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false}>
            <Copy>
              <Copy>
                <Copy>
                  http://i.imgur.com/mp79p5T.png
                </Copy>
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Copy width={debugSize} height={debugSize} opaque={false}>
            <Copy>
              <Copy>
                <Copy>
                  <Copy>
                    http://i.imgur.com/mp79p5T.png
                  </Copy>
                </Copy>
              </Copy>
            </Copy>
          </Copy>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize} premultipliedAlpha>
              <HelloGL />
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize} premultipliedAlpha>
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <TransparentNonPremultiplied width={debugSize} height={debugSize} premultipliedAlpha>
              <Copy>
                <TransparentNonPremultiplied>
                  <Copy>
                    http://i.imgur.com/S22HNaU.png
                  </Copy>
                </TransparentNonPremultiplied>
              </Copy>
            </TransparentNonPremultiplied>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Layer width={debugSize} height={debugSize} opaque={false} premultipliedAlpha debug>
            http://i.imgur.com/mp79p5T.png
            <TransparentNonPremultiplied>
              <HelloGL />
            </TransparentNonPremultiplied>
          </Layer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Layer width={debugSize} height={debugSize} opaque={false}>
            http://i.imgur.com/mp79p5T.png
            <TransparentNonPremultiplied>
              <Copy>
                <TransparentNonPremultiplied>
                  <Copy>
                    http://i.imgur.com/S22HNaU.png
                  </Copy>
                </TransparentNonPremultiplied>
              </Copy>
            </TransparentNonPremultiplied>
          </Layer>
        </NativeLayer>

      </View>

    </ScrollView>;
  }
}

AppRegistry.registerComponent("Tests", () => Tests);

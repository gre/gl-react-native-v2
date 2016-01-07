const React = require("react-native");
const {
  Text,
  View,
  ScrollView,
  Image,
} = React;
const { Surface } = require("gl-react-native");
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
      <View style={{ width: 400, height: 400, position: "relative", backgroundColor: "transparent" }}>
        {[0,1,2,3].map(i => <Text style={{
          position: "absolute",
          top: 20+100*i,
          left: 0,
          width: 400,
          height: 100,
          textAlign: "center",
          color: ["#f00", "#0f0", "#00f", "#fff"][i],
          fontSize: 40
        }}>
          Hello World {i}
        </Text>)}
      </View>;

    const img = "http://i.imgur.com/zJIxPEo.jpg";

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
      <Surface width={viewportW} height={viewportW} preload onLoad={this.onLoad} onProgress={this.onProgress}>
        <Display2>
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
      </Surface>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              http://i.imgur.com/mp79p5T.png
            </Copy>
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                http://i.imgur.com/mp79p5T.png
              </Copy>
            </Copy>
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                <Copy>
                  http://i.imgur.com/mp79p5T.png
                </Copy>
              </Copy>
            </Copy>
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
              <Copy>
                <Copy>
                  <Copy>
                    http://i.imgur.com/mp79p5T.png
                  </Copy>
                </Copy>
              </Copy>
            </Copy>
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Copy last>
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
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <Surface width={debugSize} height={debugSize}>
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </Surface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <Surface width={debugSize} height={debugSize}>
              <TransparentNonPremultiplied>
                <TransparentNonPremultiplied>
                  <HelloGL />
                </TransparentNonPremultiplied>
              </TransparentNonPremultiplied>
            </Surface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <NativeLayer>
            <Image source={{ uri: "http://i.imgur.com/mp79p5T.png" }} width={debugSize} height={debugSize} />
            <Surface width={debugSize} height={debugSize}>
              <TransparentNonPremultiplied>
                <Copy>
                  <TransparentNonPremultiplied>
                    <Copy>
                      http://i.imgur.com/S22HNaU.png
                    </Copy>
                  </TransparentNonPremultiplied>
                </Copy>
              </TransparentNonPremultiplied>
            </Surface>
          </NativeLayer>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Layer>
              http://i.imgur.com/mp79p5T.png
              <TransparentNonPremultiplied>
                <HelloGL />
              </TransparentNonPremultiplied>
            </Layer>
          </Surface>
        </NativeLayer>

        <NativeLayer width={debugSize} height={debugSize}>
          <Image source={{ uri: "http://i.imgur.com/S22HNaU.png" }} width={debugSize} height={debugSize} />
          <Surface width={debugSize} height={debugSize} opaque={false}>
            <Layer>
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
          </Surface>
        </NativeLayer>

      </View>

    </ScrollView>;
  }
}

module.exports = Tests;

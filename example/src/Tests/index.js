import React from "react";
import { Text, View, ScrollView, Image } from "react-native";
import { Surface } from "gl-react-native";
import { Blur } from "gl-react-blur";
import Add from "./Add";
import Multiply from "./Multiply";
import Layer from "./Layer";
import NativeLayer from "./NativeLayer";
import HelloGL from "./HelloGL";
import Display2 from "./Display2";
import Copy from "./Copy";
import ColoredDisc from "./ColoredDisc";
import DiamondCrop from "./DiamondCrop";
import TransparentNonPremultiplied from "./TransparentNonPremultiplied";
import Dimensions from "Dimensions";
const { width: viewportW, height: viewportH } = Dimensions.get("window");

class Tests extends React.Component {
  constructor(props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.onProgress = this.onProgress.bind(this);
  }
  onLoad() {
    console.log("LOADED");
  }
  onProgress({ nativeEvent: { progress, loaded, total } }) {
    console.log("PROGRESS", progress, loaded, total);
  }
  render() {
    const debugSize = viewportW / 4;

    const helloGL = <HelloGL width={64} height={64} />;

    const txt = (
      <View
        key="txt"
        style={{
          width: 400,
          height: 400,
          position: "relative",
          backgroundColor: "transparent"
        }}
      >
        {[0, 1, 2, 3].map(i =>
          <Text
            key={i}
            style={{
              position: "absolute",
              top: 20 + 100 * i,
              left: 0,
              width: 400,
              height: 100,
              textAlign: "center",
              color: ["#f00", "#0f0", "#00f", "#fff"][i],
              fontSize: 40
            }}
          >
            Hello World {i}
          </Text>
        )}
      </View>
    );

    const img = "https://i.imgur.com/zJIxPEo.jpg";

    const blurredImage = (
      <Blur factor={4} passes={6} width={200} height={200}>
        {img}
      </Blur>
    );

    const blurredImageOverText = (
      <Layer>
        {blurredImage}
        {txt}
      </Layer>
    );

    return (
      <ScrollView style={{ backgroundColor: "#000", flex: 1 }}>
        <Surface
          width={viewportW}
          height={viewportW}
          preload
          onLoad={this.onLoad}
          onProgress={this.onProgress}
        >
          <Display2>
            <Add width={viewportW / 2} height={viewportH / 2}>
              {txt}
              {helloGL}
            </Add>
            <Display2 width={viewportW / 2} height={viewportH / 2} vertical>
              <Blur
                factor={1}
                passes={4}
                width={viewportW / 2}
                height={viewportH / 4}
              >
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
            <Image
              key={0}
              source={{ uri: "https://i.imgur.com/S22HNaU.png" }}
              width={debugSize}
              height={debugSize}
            />
            <Image
              key={1}
              source={{ uri: "https://i.imgur.com/mp79p5T.png" }}
              width={debugSize}
              height={debugSize}
            />
          </NativeLayer>

          <NativeLayer width={debugSize} height={debugSize}>
            <Image
              key={0}
              source={{ uri: "https://i.imgur.com/S22HNaU.png" }}
              width={debugSize}
              height={debugSize}
            />
            <Surface
              width={debugSize}
              height={debugSize}
              backgroundColor="transparent"
              setZOrderOnTop
            >
              <Copy last>
                <Copy>
                  <Copy>
                    <Copy>https://i.imgur.com/mp79p5T.png</Copy>
                  </Copy>
                </Copy>
              </Copy>
            </Surface>
          </NativeLayer>

          <NativeLayer width={debugSize} height={debugSize}>
            <Image
              source={{ uri: "https://i.imgur.com/S22HNaU.png" }}
              width={debugSize}
              height={debugSize}
            />
            <Surface
              width={debugSize}
              height={debugSize}
              backgroundColor="transparent"
              setZOrderOnTop
            >
              <Layer>
                https://i.imgur.com/mp79p5T.png
                <TransparentNonPremultiplied>
                  <HelloGL />
                </TransparentNonPremultiplied>
              </Layer>
            </Surface>
          </NativeLayer>

          <NativeLayer width={debugSize} height={debugSize}>
            <Image
              source={{ uri: "https://i.imgur.com/S22HNaU.png" }}
              width={debugSize}
              height={debugSize}
            />
            <Surface
              width={debugSize}
              height={debugSize}
              backgroundColor="transparent"
              setZOrderOnTop
            >
              <Layer>
                https://i.imgur.com/mp79p5T.png
                <TransparentNonPremultiplied>
                  <Copy>
                    <TransparentNonPremultiplied>
                      <Copy>https://i.imgur.com/S22HNaU.png</Copy>
                    </TransparentNonPremultiplied>
                  </Copy>
                </TransparentNonPremultiplied>
              </Layer>
            </Surface>
          </NativeLayer>

          <Surface width={debugSize} height={debugSize}>
            <HelloGL width={2} height={2} pixelRatio={1} />
          </Surface>

          <Surface
            style={{ borderRadius: 50 }}
            width={debugSize}
            height={debugSize}
          >
            <HelloGL />
          </Surface>

          <Surface style={{ margin: 4 }} width={300} height={300}>
            <Blur passes={6} factor={2}>
              https://i.imgur.com/rkiglmm.jpg
            </Blur>
          </Surface>
        </View>
      </ScrollView>
    );
  }
}

module.exports = Tests;

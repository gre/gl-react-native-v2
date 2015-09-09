const React = require("react-native");
const {
  AppRegistry,
  Text,
  View,
} = React;

const Blur = require("./Blur");
const Add = require("./Add");
const Multiply = require("./Multiply");
const Layer = require("./Layer");
const HelloGL = require("./HelloGL");
const Display2 = require("./Display2");
const { width: viewportW, height: viewportH } = require("Dimensions").get("window");

const Tests = React.createClass({
  render: function() {
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

    return <View style={{ backgroundColor: "#000" }}>
      <Display2 width={viewportW} height={viewportH} vertical preload>
        <Display2 width={viewportW} height={viewportH/2}>
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
        {txt}
      </Display2>
    </View>;
  }
});

AppRegistry.registerComponent("Tests", () => Tests);

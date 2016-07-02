import React, {
  Component,
} from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Blur } from "gl-react-blur";
import { Surface } from "gl-react-native";

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
  }
});

const samples = [1,2,3,4,5,6,7,8];

export default class Orientation extends Component {
  render () {
    return (
<ScrollView>
<View style={styles.container}>
  {samples.map(i =>
    <Surface key={`landscape_${i}`} width={120} height={90}>
      <Blur factor={0.2} passes={2}>
        {`https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_${i}.jpg`}
      </Blur>
    </Surface>)}
</View>
<View style={styles.container}>
  {samples.map(i =>
    <Surface key={`portrait_${i}`} width={120} height={160}>
      <Blur factor={0.2} passes={2}>
        {`https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Portrait_${i}.jpg`}
      </Blur>
    </Surface>)}
</View>
</ScrollView>
    );
  }
}

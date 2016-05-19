import React, {Component} from "react";
import {StyleSheet, ListView} from "react-native";
import seedrandom from "seedrandom";
import Dimensions from "Dimensions";
const { width: viewportWidth } = Dimensions.get("window");
import {Surface} from "gl-react-native";
import Heart from "./Heart";

const sameColor = ([r,g,b], [R,G,B]) =>
  r===R && g===G && b===B;

const rowHasChanged = (r1, r2) =>
  !sameColor(r1.color, r2.color);

const increment = 3;
const seed = "gl-react is awesome";

const genRows = nb => {
  const rows = [];
  const random = seedrandom(seed);
  for (let i = 0; i < nb; i++) {
    rows.push({
      color: [ random(), random(), random() ]
    });
  }
  return rows;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  }
});

class Hearts extends Component {
  constructor (props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged
      }).cloneWithRows(genRows(increment))
    };
  }
  more = () => {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.cloneWithRows(genRows(increment + dataSource.getRowCount()))
    });
  };
  render () {
    return (
      <ListView
        style={styles.container}
        dataSource={this.state.dataSource}
        onEndReached={this.more}
        renderRow={({ color }) =>
          <Surface width={viewportWidth} height={viewportWidth}>
            <Heart color={color} />
          </Surface>}
      />
    );
  }
}

module.exports = Hearts;

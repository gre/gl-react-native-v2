const React = require("react-native");
const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
} = React;

const HelloGL = require("./HelloGL");
const Sepia = require("./Sepia");

const Simple = React.createClass({
  render: function() {
    return <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Welcome to GL React Native!
      </Text>
      <View style={styles.demos}>
        <Text style={styles.demoTitle}>1. Hello GL</Text>
        <View style={styles.demo}>
          <HelloGL width={256} height={144} />
        </View>

        <Text style={styles.demoTitle}>2. Sepia on an Image</Text>
        <View style={styles.demo}>
          <Sepia
            width={256}
            height={144}
            factor={0.6}
            image={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }} />
        </View>
      </View>
    </ScrollView>;
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 5,
    marginBottom: 20,
    fontWeight: "bold"
  },
  demos: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  demoTitle: {
    fontSize: 20,
    margin: 5,
    fontStyle: "italic"
  },
});

AppRegistry.registerComponent("Simple", () => Simple);

import React, {
  StyleSheet,
  Component,
  View,
  PropTypes,
  Text,
  TouchableOpacity,
  Navigator,
} from "react-native";

const screens = {
  Simple: require("./Simple"),
  AdvancedEffects: require("./AdvancedEffects"),
  Hearts: require("./Hearts"),
  Tests: require("./Tests"),
};

const homeRoute = {
  id: "home",
  title: "gl-react Showcase"
};

const routes = [
  { id: "Simple" },
  { id: "AdvancedEffects" },
  { id: "Hearts" },
  { id: "Tests" },
];

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#333",
    flex: 1,
  },
  navBar: {
    backgroundColor: "#000"
  },
  leftButtonContainer: {

  },
  leftButtonText: {
    color: "#999",
    paddingLeft: 6,
  },
  title: {
    color: "#999",
    fontSize: 14
  },
  home: {
    flex: 1,
    marginTop: 40,
  },
  homeLink: {
    padding: 20,
  },
  homeText: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "bold",
  },
});

class Home extends Component {
  static propTypes = {
    openScreen: PropTypes.func.isRequired
  };
  render () {
    const { openScreen } = this.props;
    return <View style={styles.home}>
      {routes.map(route =>
        <TouchableOpacity style={styles.homeLink} key={route.id} onPress={() => openScreen(route)}>
          <Text style={styles.homeText}>{route.id}</Text>
        </TouchableOpacity>)}
    </View>;
  }
}

export default class App extends Component {
  static propTypes = {};
  renderScene = (route, navigator) => {
    if (route.id === homeRoute.id) {
      return <Home openScreen={route => navigator.push(route)} />;
    }
    const Screen = screens[route.id];
    return <Screen />;
  };
  render () {
    return (
      <View style={styles.root}>
        <Navigator
          style={styles.navBar}
          initialRoute={homeRoute}
          renderScene={this.renderScene}
          navigationBar={
            <Navigator.NavigationBar
              routeMapper={{
                LeftButton: (route, navigator, index) =>
                  index === 0 ? null :
                  <TouchableOpacity
                    onPress={() => navigator.pop()}
                    style={styles.leftButtonContainer}>
                    <Text style={styles.leftButtonText}>
                      {"< BACK"}
                    </Text>
                  </TouchableOpacity>,

                RightButton: () => {},

                Title: route =>
                  <Text style={styles.title}>
                    {route.title || route.id}
                  </Text>
              }}
            />
          }
        />
      </View>
    );
  }
}

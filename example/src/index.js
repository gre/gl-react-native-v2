import React, {Component, PropTypes} from "react";
import {StyleSheet, View, Text, TouchableOpacity, Navigator, AsyncStorage} from "react-native";

import Simple from "./Simple";
import AdvancedEffects from "./AdvancedEffects";
import Hearts from "./Hearts";
import Tests from "./Tests";
import Animated from "./Animated";
import Particles from "./Particles";
import Orientation from "./Orientation";

const screens = {
  Simple,
  AdvancedEffects,
  Hearts,
  Tests,
  Animated,
  Particles,
  Orientation,
};

const homeRoute = {
  id: "home",
  title: "gl-react Showcase"
};

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
      {Object.keys(screens).map(id =>
        <TouchableOpacity style={styles.homeLink} key={id} onPress={() => openScreen({ id })}>
          <Text style={styles.homeText}>{id}</Text>
        </TouchableOpacity>)}
    </View>;
  }
}

export default class App extends Component {
  static propTypes = {};
  constructor (props) {
    super(props);
    this.state = {
      initialRoute: homeRoute
    };
    /*
    new Promise((success, failure) =>
      AsyncStorage.getItem("route", (error, result) => {
        if (error) failure(error);
        else success(result);
      }))
    .then(result => {
      const route = JSON.parse(result);
      if (!route) throw new Error("invalid route");
      return route;
    })
    .catch(() => homeRoute)
    .then(initialRoute => this.setState({ initialRoute }));
    */
  }
  renderScene = (route, navigator) => {
    if (route.id === homeRoute.id) {
      return <Home openScreen={route => navigator.push(route)} />;
    }
    const Screen = screens[route.id];
    return <Screen />;
  };
  render () {
    const { initialRoute } = this.state;
    if (!initialRoute) return <View />;
    return (
      <View style={styles.root}>
        <Navigator
          style={styles.navBar}
          renderScene={this.renderScene}
          initialRoute={initialRoute}
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

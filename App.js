import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline } from "react-native-maps";

const Stack = createNativeStackNavigator();

// Home Screen
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HitchTracker</Text>
      <Button title="Start Ride" onPress={() => navigation.navigate("Map")} />
    </View>
  );
}

// Map / Ride Screen
function MapScreen({ navigation }) {
  const [rideActive, setRideActive] = useState(false);
  const [locations, setLocations] = useState([]);
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);

  const startRide = () => {
    setRideActive(true);
    // TODO: start GPS tracking
    setLocations([{ latitude: 51.5074, longitude: -0.1278 }]); // dummy start
  };

  const stopRide = () => {
    setRideActive(false);
    // TODO: finalize distance calculation
    setDistance(2.5); // dummy km
    setPrice(5); // dummy price
    navigation.navigate("Summary", { distance: 2.5, price: 5 });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1, width: "100%" }}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {locations.length > 0 && (
          <Marker coordinate={locations[0]} title="Taxi" />
        )}
        {locations.length > 1 && <Polyline coordinates={locations} />}
      </MapView>
      <View style={styles.buttonContainer}>
        {!rideActive && <Button title="Start Ride" onPress={startRide} />}
        {rideActive && <Button title="Stop Ride" onPress={stopRide} />}
      </View>
    </View>
  );
}

// Summary Screen
function SummaryScreen({ route, navigation }) {
  const { distance, price } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Summary</Text>
      <Text>Distance: {distance} km</Text>
      <Text>Price: €{price}</Text>
      <Button
        title="Back to Home"
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
}

// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "90%",
    alignSelf: "center",
  },
});


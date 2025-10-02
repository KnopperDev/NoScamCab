import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline } from "react-native-maps";
import styles from "./styles";
import * as Location from "expo-location";
import haversine from "haversine-distance";

const getDistance = (coords) => {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1], coords[i]);
  }
  return total / 1000; // convert meters to km
};

const Stack = createNativeStackNavigator();

// Home Screen
function HomeScreen({ navigation }) {
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
    })();
  }, []);

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
  const [subscription, setSubscription] = useState(null);
  const [simulate, setSimulate] = useState(true); // 👈 simulation toggle

  const startRide = async () => {
    setRideActive(true);

    if (simulate) {
      // --- Fake movement simulation ---
      let lat = 51.5074;
      let lng = -0.1278;

      const fakeTracking = setInterval(() => {
        lat += 0.001; // ~111m step north
        lng += 0.001; // ~111m step east

        setLocations((prev) => [...prev, { latitude: lat, longitude: lng }]);
      }, 2000); // every 2s

      setSubscription({ remove: () => clearInterval(fakeTracking) });
    } else {
      // --- Real GPS tracking ---
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          setLocations((prev) => [
            ...prev,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          ]);
        }
      );
      setSubscription(sub);
    }
  };

  const stopRide = () => {
    setRideActive(false);
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }

    if (locations.length < 2) {
      navigation.navigate("Summary", { distance: 0, price: 0 });
      return;
    }

    const totalDistance = getDistance(locations);
    const price = totalDistance * 2; // example: €2/km

    navigation.navigate("Summary", { distance: totalDistance, price });
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
          <Marker coordinate={locations[0]} title="Start" />
        )}
        {locations.length > 1 && (
          <>
            <Marker coordinate={locations[locations.length - 1]} title="Now" />
            <Polyline coordinates={locations} />
          </>
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        {!rideActive && <Button title="Start Ride" onPress={startRide} />}
        {rideActive && <Button title="Stop Ride" onPress={stopRide} />}
        {!rideActive && (
          <Button
            title={`Simulation: ${simulate ? "ON" : "OFF"}`}
            onPress={() => setSimulate((s) => !s)}
          />
        )}
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
      <Text>Distance: {distance.toFixed(3)} km</Text>
      <Text>Price: €{price.toFixed(2)}</Text>
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


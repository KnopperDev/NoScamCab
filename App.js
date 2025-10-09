import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapView, { Marker, Polyline } from "react-native-maps";
import styles from "./styles";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "./CustomButton";

const Stack = createNativeStackNavigator();

// Helper: compute distance between a series of coords in km
const getDistance = (coords) => {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1], coords[i]);
  }
  return total / 1000;
};

// Resolve location name to lat/lon using Nominatim
const geocode = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": "HitchTracker/1.0",
          "Accept-Language": "en",
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.length) return null;
    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Fetch OSRM route between start and end
const getRoute = async (startCoords, endCoords) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching route:", error);
    return [];
  }
};

// Home Screen
function HomeScreen({ navigation }) {
  const [pricePerKm, setPricePerKm] = useState("2.00");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        alert("Permission to access location was denied");
    })();
  }, []);

  const handleStartRide = async () => {
    if (!startLocation || !endLocation)
      return alert("Please enter both locations.");
    const normalizedPrice = parseFloat(pricePerKm.replace(",", "."));
    if (isNaN(normalizedPrice) || normalizedPrice <= 0)
      return alert("Enter a valid price per km.");

    try {
      const startCoords = await geocode(startLocation);
      await new Promise((r) => setTimeout(r, 1500));
      const endCoords = await geocode(endLocation);

      if (!startCoords?.length) return alert("Start location not found.");
      if (!endCoords?.length) return alert("Destination not found.");

      const start = startCoords[0];
      const end = endCoords[0];

      navigation.navigate("Map", {
        pricePerKm: normalizedPrice,
        startLocation: start.display_name,
        endLocation: end.display_name,
        startCoords: start,
        endCoords: end,
      });
    } catch (error) {
      console.error(error);
      alert("Error fetching locations.");
    }
  };

  return (
    <View style={styles.containerHome}>
      <Text style={styles.title}>HitchTracker</Text>
      <Text style={styles.subtitle}>Plan and track your rides</Text>

      <Text style={styles.priceInfo}>Price per km (€):</Text>
      <TextInput
        style={styles.input}
        placeholder="2.00"
        keyboardType="decimal-pad"
        value={pricePerKm}
        onChangeText={(text) => setPricePerKm(text.replace(/[^\d.,]/g, ""))}
      />

      <Text style={styles.priceInfo}>Start Location:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter starting point"
        value={startLocation}
        onChangeText={setStartLocation}
      />

      <Text style={styles.priceInfo}>Destination:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter destination"
        value={endLocation}
        onChangeText={setEndLocation}
      />

      <View style={styles.buttonStack}>
        <CustomButton
          title="Start Ride"
          onPress={handleStartRide}
          type="primary"
        />
      </View>
      <View style={styles.buttonStack}>
        <CustomButton
          title="View Ride History"
          onPress={() => navigation.navigate("RideHistory")}
          type="secondary"
        />
      </View>
    </View>
  );
}

// Map / Ride Screen
function MapScreen({ route, navigation }) {
  const { pricePerKm, startLocation, endLocation, startCoords, endCoords } =
    route.params;

  const [rideActive, setRideActive] = useState(false);
  const [locations, setLocations] = useState([]);
  const locationsRef = useRef([]);
  const [subscription, setSubscription] = useState(null);
  const [simulate, setSimulate] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState("0m 00s");
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);

  // Keep ref updated
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  // Load OSRM route
  useEffect(() => {
    (async () => {
      const coords = await getRoute(startCoords, endCoords);
      setRouteCoords(coords);
    })();
  }, []);

  // Interval to update elapsed, distance, price
  useEffect(() => {
    if (!rideActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const durationMs = now - startTime;
      const minutes = Math.floor(durationMs / 1000 / 60);
      const seconds = Math.floor((durationMs / 1000) % 60);
      setElapsed(`${minutes}m ${seconds.toString().padStart(2, "0")}s`);

      const totalDistance = getDistance(locationsRef.current);
      setDistance(totalDistance);
      setPrice(totalDistance * pricePerKm);
    }, 1000);

    return () => clearInterval(interval);
  }, [rideActive, startTime, pricePerKm]);

  const startRide = async () => {
    setRideActive(true);
    setStartTime(Date.now());

    if (simulate) {
      if (!routeCoords.length)
        return alert("No route available for simulation.");

      let stepIndex = 0;
      setLocations([{ ...routeCoords[0], timestamp: Date.now() }]);

      const fakeTracking = setInterval(() => {
        if (stepIndex >= routeCoords.length) return clearInterval(fakeTracking);

        const nextPoint = routeCoords[stepIndex];
        setLocations((prev) => [
          ...prev,
          { ...nextPoint, timestamp: Date.now() },
        ]);
        stepIndex++;
      }, 100);
      setSubscription({ remove: () => clearInterval(fakeTracking) });
    } else {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocations((prev) => [
            ...prev,
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: loc.timestamp,
            },
          ]);
        }
      );
      setSubscription(sub);
    }
  };

  const stopRide = () => {
    setRideActive(false);
    subscription?.remove?.();

    navigation.navigate("Summary", {
      date: new Date().toLocaleString(),
      distance,
      price,
      duration: elapsed,
      startLocation,
      endLocation,
      saveOption: true,
    });

    setLocations([]);
    setStartTime(null);
    setElapsed("0m 00s");
    setDistance(0);
    setPrice(0);
  };

  return (
    <View style={styles.containerMap}>
      <View style={styles.mapStatusBar}>
        <Text style={styles.statusText}>⏱️ {elapsed}</Text>
        <Text style={styles.statusText}>📍 {distance.toFixed(2)} km</Text>
        <Text style={styles.statusText}>💶 €{price.toFixed(2)}</Text>
      </View>

      <MapView
        style={{ flex: 1, width: "100%" }}
        initialRegion={{
          latitude: startCoords.lat,
          longitude: startCoords.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: startCoords.lat, longitude: startCoords.lon }}
          title="Start"
        />
        <Marker
          coordinate={{ latitude: endCoords.lat, longitude: endCoords.lon }}
          title="Destination"
        />
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        {locations.length > 1 && (
          <Polyline coordinates={locations} strokeWidth={4} strokeColor="red" />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        {!rideActive && (
          <CustomButton
            title="Start Ride"
            onPress={startRide}
            type="primary"
            fullWidth
          />
        )}
        {rideActive && (
          <CustomButton
            title="Stop Ride"
            onPress={stopRide}
            type="tertiary"
            fullWidth
          />
        )}
        {!rideActive && (
          <CustomButton
            title={`Simulation: ${simulate ? "ON" : "OFF"}`}
            onPress={() => setSimulate((s) => !s)}
            type="secondary"
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

// Summary Screen
function SummaryScreen({ route, navigation }) {
  const { distance, price, duration, saveOption, startLocation, endLocation } =
    route.params;

  const saveRide = async () => {
    try {
      const existing = await AsyncStorage.getItem("rides");
      const rides = existing ? JSON.parse(existing) : [];
      // add newest ride at the beginning so newest appears at top
      rides.unshift({
        date: new Date().toLocaleString(),
        distance,
        price,
        duration,
        startLocation,
        endLocation,
      });
      await AsyncStorage.setItem("rides", JSON.stringify(rides));
    } catch (error) {
      console.error("Error saving ride:", error);
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.containerSummary}>
      <Text style={styles.title}>Ride Summary</Text>
      <Text>From: {startLocation}</Text>
      <Text>To: {endLocation}</Text>
      <Text>Duration: {duration}</Text>
      <Text>Distance: {distance.toFixed(3)} km</Text>
      <Text>Price: €{price.toFixed(2)}</Text>

      {saveOption ? (
        <>
          <View style={styles.buttonStack}>
            <CustomButton
              title="Save to History"
              onPress={saveRide}
              type="primary"
            />
          </View>
          <View style={styles.buttonStack}>
            <CustomButton
              title="Discard / Back to Home"
              onPress={() => navigation.navigate("Home")}
              type="tertiary"
            />
          </View>
        </>
      ) : (
        <CustomButton
          title="Back to Home"
          onPress={() => navigation.navigate("Home")}
          type="primary"
        />
      )}
    </View>
  );
}

// Ride History Screen
function RideHistoryScreen({ navigation }) {
  const [rides, setRides] = useState([]);

  const loadRides = async () => {
    try {
      const saved = await AsyncStorage.getItem("rides");
      if (saved) setRides(JSON.parse(saved)); // stored with newest-first via unshift
    } catch (error) {
      console.error("Error loading rides:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadRides);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.containerSummary}>
      <Text style={styles.title}>Ride History</Text>
      {rides.length === 0 ? (
        <Text>No rides saved yet.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.rideItem}>
              <Text>Date: {item.date}</Text>
              <Text>From: {item.startLocation}</Text>
              <Text>To: {item.endLocation}</Text>
              <Text>Duration: {item.duration}</Text>
              <Text>Distance: {item.distance.toFixed(3)} km</Text>
              <Text>Price: €{item.price.toFixed(2)}</Text>
            </View>
          )}
        />
      )}
      <CustomButton
        title="Back to Home"
        onPress={() => navigation.navigate("Home")}
        type="primary"
      />
      <View style={styles.buttonStack}>
        <CustomButton
          title="Remove All Rides"
          onPress={() => {
            AsyncStorage.removeItem("rides");
            setRides([]);
          }}
          type="tertiary"
        />
      </View>
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
        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


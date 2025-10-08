import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Home screen
  containerHome: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
  },

  // Map screen
  containerMap: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },

  // Summary & History screens
  containerSummary: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginVertical: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },

  priceInfo: {
    fontSize: 16,
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    alignSelf: "flex-start",
  },

  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  // Bottom button panel (Map screen)
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  // Custom buttons
  buttonBase: {
    flex: 1,
    marginHorizontal: 5, // for horizontal spacing
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#00ef44ff",
  },
  buttonSecondary: {
    backgroundColor: "#00ccffff",
  },
  buttonTertiary: {
    backgroundColor: "#ff0000ff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  backButton: {
    marginTop: 20,
    width: "100%",
  },

  // Stacked buttons spacing for Home & Summary screens
  buttonStack: {
    width: "100%",
    marginBottom: 15, // vertical spacing between stacked buttons
    marginTop: 10,
  },

  // Ride history items
  rideItem: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  // Summary/Info text
  rideText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  mapStatusBar: {
    position: "absolute",
    top: 20,
    left: "5%",
    right: "5%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 999,
  },

  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

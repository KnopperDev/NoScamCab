import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Home screen
  containerHome: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#f0f0f0",
  },
  // Map screen
  containerMap: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  // Summary screen
  containerSummary: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },

  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
  },

  // Bottom button panel
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",

    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  // Custom buttons
  buttonBase: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
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
  },
});

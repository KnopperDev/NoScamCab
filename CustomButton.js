import React from "react";
import { TouchableOpacity, Text } from "react-native";
import styles from "./styles";

export default function CustomButton({
  title,
  onPress,
  type = "primary",
  fullWidth = false,
  style,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        type === "secondary"
          ? styles.buttonSecondary
          : type === "tertiary"
          ? styles.buttonTertiary
          : styles.buttonPrimary,
        fullWidth ? { alignSelf: "stretch" } : { flex: 0 }, // prevents stretching
        style,
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

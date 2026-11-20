import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { palette } from "../theme/theme";

type Props = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({
  label,
  value,
  accent = palette.primary,
}: Props) {
  // Select an icon according to the card label
  const iconName =
    label === "Müştərilər"
      ? "account-group-outline"
      : label === "Satışlar"
        ? "chart-line"
        : "cash-multiple";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${accent}18` },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={accent}
          />
        </View>
      </View>

      <Text
        variant="headlineSmall"
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <View
        style={[
          styles.accentLine,
          { backgroundColor: accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    overflow: "hidden",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: palette.muted,
    fontWeight: "600",
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  value: {
    marginTop: 15,
    fontWeight: "800",
    color: palette.navy,
  },

  accentLine: {
    height: 3,
    width: 35,
    borderRadius: 5,
    marginTop: 14,
  },
});
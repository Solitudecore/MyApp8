import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import type { ChartPoint } from "../types/models";
import { palette } from "../theme/theme";

type Props = {
  title: string;
  points: ChartPoint[];
};

export function BarChart({ title, points }: Props) {
  // Find the highest sales value
  const max = Math.max(
    1,
    ...points.map((point) => Number(point.value) || 0),
  );

  return (
    <View style={styles.card}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>

          <Text style={styles.subtitle}>
            Aylıq satış statistikası
          </Text>
        </View>

        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>6 AY</Text>
        </View>
      </View>

      {/* Empty State */}
      {points.length === 0 ? (
        <Text style={styles.empty}>
          Hələ qrafik üçün satış məlumatı yoxdur.
        </Text>
      ) : (
        <View style={styles.chart}>
          {points.map((point, index) => {
            // Calculate bar height percentage
            const value = Math.max(0, Number(point.value) || 0);

            const percent = Math.max(
              3,
              (value / max) * 100,
            );

            // Highlight the month with the highest sales
            const isHighest = value === max && value > 0;

            return (
              <View
                style={styles.column}
                key={`${point.label}-${index}`}
              >
                {/* Sales Amount */}
                <Text
                  style={styles.amount}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {value.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </Text>

                {/* Bar Background */}
                <View style={styles.barSpace}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${percent}%` as `${number}%`,
                          backgroundColor: isHighest
                            ? palette.success
                            : palette.primary,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Month Label */}
                <Text
                  style={[
                    styles.caption,
                    isHighest && styles.activeCaption,
                  ]}
                  numberOfLines={1}
                >
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  title: {
    fontWeight: "800",
    color: palette.navy,
    fontSize: 18,
  },

  subtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 5,
  },

  periodBadge: {
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },

  periodText: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Empty State
  empty: {
    color: palette.muted,
    paddingVertical: 35,
    textAlign: "center",
    fontSize: 13,
  },

  // Chart
  chart: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 195,
    marginTop: 22,
    gap: 8,
  },

  column: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    minWidth: 0,
  },

  amount: {
    color: palette.navy,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  // Bar Background
  barSpace: {
    width: "75%",
    flex: 1,
    justifyContent: "flex-end",
  },

  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "#EEF2F8",
    borderRadius: 10,
    overflow: "hidden",
  },

  bar: {
    width: "100%",
    minHeight: 3,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },

  // Month Labels
  caption: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },

  activeCaption: {
    color: palette.success,
    fontWeight: "800",
  },
});

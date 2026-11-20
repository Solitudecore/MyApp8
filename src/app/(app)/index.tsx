import { useCallback, useRef, useState } from "react";

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";

import {
  ActivityIndicator,
  Button,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";

import { PieChart } from "react-native-gifted-charts";

import { BarChart } from "../../components/BarChart";
import { StatCard } from "../../components/StatCard";

import { useAuth } from "../../context/AuthContext";

import { getClients } from "../../database/clientRepository";

import {
  getDashboardStats,
  getSalesByClientId,
} from "../../database/saleRepository";

import { palette } from "../../theme/theme";

import type {
  ClientSummary,
  DashboardStats,
  Sale,
} from "../../types/models";

import { money } from "../../utils/format";

const chartColors = [
  "#2367E8",
  "#068D6E",
  "#F1AA34",
  "#805AD5",
  "#E25C5C",
];

export default function DashboardPage() {
  const { signOut } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [topClients, setTopClients] = useState<ClientSummary[]>([]);

  const [selectedClient, setSelectedClient] =
    useState<ClientSummary | null>(null);

  const [selectedSales, setSelectedSales] = useState<Sale[]>([]);

  const [loading, setLoading] = useState(true);

  const [salesLoading, setSalesLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const salesRequestId = useRef(0);

  
  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      Promise.all([
        getDashboardStats(),
        getClients(),
      ])
        .then(([dashboardData, clientsData]) => {
          if (active) {
            setStats(dashboardData);

            const sortedClients = clientsData
              .filter((client) => Number(client.totalSales) > 0)
              .sort(
                (a, b) =>
                  Number(b.totalSales) - Number(a.totalSales),
              )
              .slice(0, 5);

            setTopClients(sortedClients);
          }
        })
        .catch((error) => {
          console.error(error);

          if (active) {
            Alert.alert("Xəta", "Statistikanı yükləmək olmadı.");
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  
  const openClientModal = async (client: ClientSummary) => {
    const requestId = ++salesRequestId.current;

    setSelectedClient(client);
    setSelectedSales([]);

    setSalesLoading(true);
    setModalVisible(true);

    try {
      const sales = await getSalesByClientId(client.id);

      if (requestId === salesRequestId.current) {
        setSelectedSales(sales);
      }
    } catch (error) {
      console.error(error);

      if (requestId === salesRequestId.current) {
        Alert.alert("Xəta", "Müştərinin satışlarını yükləmək olmadı.");
      }
    } finally {
      if (requestId === salesRequestId.current) {
        setSalesLoading(false);
      }
    }
  };

  
  const closeClientModal = () => {
    salesRequestId.current += 1;

    setModalVisible(false);
    setSelectedClient(null);
    setSelectedSales([]);
    setSalesLoading(false);
  };

  
  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);

      Alert.alert("Xəta", "Çıxış zamanı problem yarandı.");
    }
  };

  
  const pieData = topClients.map((client, index) => ({
    value: Number(client.totalSales),
    color: chartColors[index % chartColors.length],
    text: client.name,
  }));

  const totalTopSales = topClients.reduce(
    (sum, client) => sum + Number(client.totalSales),
    0,
  );

  return (
    <>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text variant="headlineMedium" style={styles.title}>
              Bizman CRM
            </Text>

            <Text style={styles.subtitle}>
              Biznesiniz bir baxışda
            </Text>
          </View>

          <Button
            icon="logout"
            mode="text"
            compact
            onPress={logout}
          >
            Çıxış
          </Button>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            style={styles.spinner}
          />
        ) : (
          <>
          
            <View style={styles.grid}>
              <StatCard
                label="Müştərilər"
                value={String(stats?.clientCount ?? 0)}
              />

              <StatCard
                label="Satışlar"
                value={String(stats?.saleCount ?? 0)}
                accent={palette.success}
              />

              <StatCard
                label="Ümumi gəlir"
                value={money(stats?.revenue ?? 0)}
                accent="#F1AA34"
              />
            </View>


            <View style={styles.chartCard}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Top 5 Clients
              </Text>

              <Text style={styles.sectionSubtitle}>
                Ən çox satış edən müştərilər
              </Text>

              {topClients.length === 0 ? (
                <Text style={styles.empty}>
                  Hələ satış məlumatı yoxdur.
                </Text>
              ) : (
                <>
                  <View style={styles.pieChartWrapper}>
                    <PieChart
                      data={pieData}
                      radius={105}
                      donut
                      innerRadius={65}
                      innerCircleColor={palette.surface}
                      centerLabelComponent={() => (
                        <View style={styles.pieCenter}>
                          <Text style={styles.pieCenterLabel}>
                            TOP 5 SALES
                          </Text>

                          <Text
                            style={styles.pieCenterValue}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {money(totalTopSales)}
                          </Text>
                        </View>
                      )}
                      focusOnPress
                      onPress={(_: unknown, index: number) => {
                        const client = topClients[index];

                        if (client) {
                          openClientModal(client);
                        }
                      }}
                      strokeWidth={2}
                      strokeColor={palette.surface}
                    />
                  </View>


                  <View style={styles.legend}>
                    {topClients.map((client, index) => {
                      const percentage =
                        totalTopSales > 0
                          ? Math.round(
                              (Number(client.totalSales) /
                                totalTopSales) *
                                100,
                            )
                          : 0;

                      return (
                        <TouchableOpacity
                          key={client.id}
                          style={styles.legendRow}
                          activeOpacity={0.7}
                          onPress={() => openClientModal(client)}
                        >
                          <View style={styles.legendLeft}>
                            <View
                              style={[
                                styles.legendDot,
                                {
                                  backgroundColor:
                                    chartColors[
                                      index % chartColors.length
                                    ],
                                },
                              ]}
                            />

                            <View style={styles.legendNameContainer}>
                              <Text
                                style={styles.legendName}
                                numberOfLines={1}
                              >
                                {client.name}
                              </Text>

                              <Text style={styles.legendSales}>
                                {client.salesCount} satış
                              </Text>
                            </View>
                          </View>

                          <View style={styles.legendRight}>
                            <Text style={styles.legendAmount}>
                              {money(Number(client.totalSales))}
                            </Text>

                            <Text style={styles.legendPercentage}>
                              {percentage}%
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
 
            <BarChart
              title="Son 6 satış ayı"
              points={stats?.monthSales ?? []}
            />


            <Button
              icon="account-plus"
              mode="contained"
              style={styles.action}
              onPress={() => router.push("/clients")}
            >
              Müştərilərə keç
            </Button>
          </>
        )}
      </ScrollView>
 
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeClientModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeClientModal}
          />

          <View style={styles.modalCard}>


            <View style={styles.modalHeader}>
              <Text
                variant="titleLarge"
                style={styles.modalTitle}
                numberOfLines={1}
              >
                Client Details
              </Text>

              <IconButton
                icon="close"
                size={24}
                onPress={closeClientModal}
                accessibilityLabel="Close"
              />
            </View>

            {selectedClient && (
              <>
              
                <View style={styles.clientInfoCard}>
                  <Text
                    variant="titleLarge"
                    style={styles.clientName}
                  >
                    {selectedClient.name}
                  </Text>

                  <Text style={styles.detail}>
                    Telefon: {selectedClient.phone || "Qeyd edilməyib"}
                  </Text>

                  <Text style={styles.detail}>
                    Email: {selectedClient.email || "Qeyd edilməyib"}
                  </Text>

                  <Divider style={styles.divider} />

                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.summaryLabel}>
                        Total Sales
                      </Text>

                      <Text style={styles.summaryValue}>
                        {money(Number(selectedClient.totalSales))}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.summaryLabel}>
                        Sales Count
                      </Text>

                      <Text style={styles.summaryValue}>
                        {selectedClient.salesCount}
                      </Text>
                    </View>
                  </View>
                </View>


                <Text
                  variant="titleMedium"
                  style={styles.salesTitle}
                >
                  Sales History
                </Text>

                <ScrollView
                  style={styles.salesScroll}
                  contentContainerStyle={styles.salesContent}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {salesLoading ? (
                    <ActivityIndicator
                      size="large"
                      style={styles.salesLoader}
                    />
                  ) : selectedSales.length === 0 ? (
                    <Text style={styles.empty}>
                      Bu müştəri üçün satış yoxdur.
                    </Text>
                  ) : (
                    selectedSales.map((sale) => (
                      <View
                        key={sale.id}
                        style={styles.saleRow}
                      >
                        <View>
                          <Text style={styles.saleLabel}>
                            Sale #{sale.id}
                          </Text>

                          <Text style={styles.saleDate}>
                            {sale.date}
                          </Text>
                        </View>

                        <Text style={styles.saleAmount}>
                          {money(Number(sale.amount))}
                        </Text>
                      </View>
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
 
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  heading: {
    flex: 1,
  },

  title: {
    color: palette.navy,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: palette.muted,
    marginTop: 5,
    fontSize: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  spinner: {
    marginTop: 60,
  },

  
  chartCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
    marginTop: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  sectionTitle: {
    color: palette.navy,
    fontWeight: "800",
    fontSize: 19,
  },

  sectionSubtitle: {
    color: palette.muted,
    marginTop: 5,
    fontSize: 13,
  },

  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },

  pieCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: 115,
  },

  pieCenterLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  pieCenterValue: {
    color: palette.navy,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 5,
  },

  
  legend: {
    marginTop: 8,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8EDF4",
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  legendNameContainer: {
    flex: 1,
  },

  legendName: {
    color: palette.navy,
    fontWeight: "700",
    fontSize: 14,
  },

  legendSales: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },

  legendRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  legendAmount: {
    color: palette.navy,
    fontWeight: "800",
    fontSize: 13,
  },

  legendPercentage: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },

  empty: {
    color: palette.muted,
    textAlign: "center",
    paddingVertical: 25,
  },

  action: {
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 5,
  },

  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },

  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "88%",
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitle: {
    color: palette.navy,
    fontWeight: "800",
    flex: 1,
  },

  clientInfoCard: {
    backgroundColor: "#F4F7FB",
    padding: 18,
    borderRadius: 17,
  },

  clientName: {
    color: palette.navy,
    fontWeight: "800",
    marginBottom: 12,
  },

  detail: {
    color: palette.muted,
    marginTop: 8,
    fontSize: 13,
  },

  divider: {
    marginVertical: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  summaryLabel: {
    fontSize: 12,
    color: palette.muted,
  },

  summaryValue: {
    color: palette.success,
    fontWeight: "800",
    fontSize: 17,
    marginTop: 6,
  },

  
  salesTitle: {
    color: palette.navy,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 12,
  },

  salesScroll: {
    maxHeight: 280,
  },

  salesContent: {
    paddingBottom: 5,
  },

  salesLoader: {
    paddingVertical: 25,
  },

  saleRow: {
    backgroundColor: "#F4F7FB",
    borderRadius: 13,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  saleLabel: {
    color: palette.navy,
    fontWeight: "700",
    fontSize: 14,
  },

  saleDate: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 5,
  },

  saleAmount: {
    color: palette.success,
    fontWeight: "800",
    fontSize: 14,
  },
});

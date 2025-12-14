import { clearTimerHistory, getTimerRecords, seedDatabase } from '@/services/Database';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

export default function ReportsScreen() {
    const [stats, setStats] = useState({
        todayFocus: 0,
        allTimeFocus: 0,
        totalDistractions: 0,
        todayDistractions: 0,
    });
    const [barData, setBarData] = useState<any>(null);
    const [pieData, setPieData] = useState<any[]>([]);

    const loadData = useCallback(() => {
        const records = getTimerRecords();
        calculateStats(records);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleClearHistory = () => {
        Alert.alert(
            "Geçmişi Temizle",
            "Tüm sayaç kayıtlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: () => {
                        clearTimerHistory();
                        loadData();
                    }
                }
            ]
        );
    };

    const calculateStats = (records: any[]) => {
        // Calculate stats for "Today" and "Last 7 Days"
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneWeekAgo = todayStart - 6 * 24 * 60 * 60 * 1000;

        let todayFocus = 0;
        let allTimeFocus = 0;
        let totalDistractions = 0;
        let todayDistractions = 0;
        const last7Days: Record<string, number> = {};
        const categoryDurations: Record<string, number> = {};

        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date(oneWeekAgo + i * 24 * 60 * 60 * 1000);
            const label = `${d.getDate()}/${d.getMonth() + 1}`;
            last7Days[label] = 0;
        }

        records.forEach(r => {
            allTimeFocus += r.duration;
            totalDistractions += (r.distractions || 0);

            if (r.timestamp >= todayStart) {
                todayFocus += r.duration;
                todayDistractions += (r.distractions || 0);
            }

            // Bar Chart Data (Last 7 Days)
            if (r.timestamp >= oneWeekAgo) {
                const d = new Date(r.timestamp);
                const label = `${d.getDate()}/${d.getMonth() + 1}`;
                if (last7Days[label] !== undefined) {
                    last7Days[label] += r.duration / 60; // Minutes
                }
            }

            // Pie Chart Data (Category)
            const cat = r.category || 'Uncategorized';
            categoryDurations[cat] = (categoryDurations[cat] || 0) + r.duration;
        });

        setStats({
            todayFocus,
            allTimeFocus,
            totalDistractions,
            todayDistractions,
        });

        // Format Bar Data
        setBarData({
            labels: Object.keys(last7Days),
            datasets: [{ data: Object.values(last7Days) }]
        });

        // Format Pie Data
        const pieColors = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#9C27B0'];
        const pData = Object.keys(categoryDurations).map((cat, index) => ({
            name: cat,
            population: categoryDurations[cat],
            color: pieColors[index % pieColors.length],
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        }));
        setPieData(pData);
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h === 0 && m === 0) {
            return `${s}s`;
        }
        if (h === 0) {
            return `${m}m ${s}s`;
        }
        return `${h}h ${m}m`;
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Rapor Paneli</Text>

            {/* General Stats */}
            <View style={styles.statsRow}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bugün</Text>
                    <Text style={styles.cardValue}>{formatDuration(stats.todayFocus)}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tüm Zamanlar</Text>
                    <Text style={styles.cardValue}>{formatDuration(stats.allTimeFocus)}</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bugünün Dikkat Dağınıklığı</Text>
                    <Text style={styles.cardValue}>{stats.todayDistractions}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Toplam Dikkat Dağınıklığı</Text>
                    <Text style={styles.cardValue}>{stats.totalDistractions}</Text>
                </View>
            </View>

            {/* Bar Chart */}
            <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
            {barData && (
                <BarChart
                    data={barData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="m"
                    chartConfig={chartConfig}
                    verticalLabelRotation={30}
                    style={styles.chart}
                />
            )}

            {/* Pie Chart */}
            <Text style={styles.chartTitle}>Kategori Dağılımı (Odaklanma Süresi Yüzdesi)</Text>
            {pieData.length > 0 ? (
                <PieChart
                    data={pieData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={'population'}
                    backgroundColor={'transparent'}
                    paddingLeft={'15'}
                    center={[10, 0]}
                    absolute={false}
                />
            ) : (
                <Text style={styles.noData}>Veri yok</Text>
            )}

            <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
                <Text style={styles.clearButtonText}>Geçmişi Temizle</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.clearButton, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB', marginTop: 10 }]} onPress={() => { seedDatabase(); loadData(); }}>
                <Text style={[styles.clearButtonText, { color: '#1976D2' }]}>Örnek Veri Ekle</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flex: 1,
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    noData: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#888',
    },
    clearButton: {
        marginTop: 30,
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    clearButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

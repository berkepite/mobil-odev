import { getTimerRecords } from '@/services/Database';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            const records = getTimerRecords();
            setHistory(records);
        }, [])
    );

    const renderItem = ({ item }: { item: any }) => {
        const mins = Math.floor(item.duration / 60);
        const secs = item.duration % 60;
        const timeString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        const d = new Date(item.timestamp);
        const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

        return (
            <View style={styles.item}>
                <Text style={styles.duration}>{timeString}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Timer History</Text>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>No saved timers yet.</Text>}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    duration: {
        fontSize: 20,
        fontWeight: '600',
    },
    date: {
        fontSize: 14,
        color: '#888',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#888',
    },
});

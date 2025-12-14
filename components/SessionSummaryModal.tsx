import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SessionSummaryModalProps {
    visible: boolean;
    onClose: () => void;
    data: {
        duration: number; // in seconds
        category: string;
        distractions: number;
    };
}

export default function SessionSummaryModal({ visible, onClose, data }: SessionSummaryModalProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Session Complete!</Text>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Duration:</Text>
                        <Text style={styles.statValue}>{formatTime(data.duration)}</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Category:</Text>
                        <Text style={styles.statValue}>{data.category}</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Distractions:</Text>
                        <Text style={styles.statValue}>{data.distractions}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.textStyle}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 5,
    },
    statLabel: {
        fontSize: 16,
        color: '#666',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#2196F3',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

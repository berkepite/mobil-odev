import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addTimerRecord, initDatabase } from '../services/Database';
import CategoryPicker from './CategoryPicker';
import SessionSummaryModal from './SessionSummaryModal';

/**
 * Main timer component that handles:
 * - Countdown logic (default 25min)
 * - State management (Active, Paused, Finished)
 * - Automatic background pause handling via AppState
 * - Saving sessions to SQLite database
 */
export default function TimerButton() {
    const DEFAULT_TIME = 25 * 60;
    const [initialDuration, setInitialDuration] = useState(DEFAULT_TIME);
    const [timer, setTimer] = useState(DEFAULT_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Timer interval reference
    const intervalRef = useRef<number | null>(null);
    const appState = useRef(AppState.currentState);

    const [category, setCategory] = useState('Ders Çalışma');
    useEffect(() => { setCategory('Ders Çalışma'); }, []);

    const [distractions, setDistractions] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [lastSession, setLastSession] = useState({ duration: 0, category: '', distractions: 0 });

    // Refs are used to access the latest state values inside the AppState listener
    // without triggering re-renders or needing to re-bind the listener.
    const isActiveRef = useRef(isActive);
    const isPausedRef = useRef(isPaused);

    useEffect(() => {
        isActiveRef.current = isActive;
        isPausedRef.current = isPaused;
    }, [isActive, isPaused]);

    useEffect(() => {
        initDatabase();
    }, []);

    // Monitor app background/foreground state
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                // Automatically pause if the app is backgrounded while the timer is running
                if (isActiveRef.current && !isPausedRef.current) {
                    handlePause();
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []); // Empty dependency array = Listener bound once

    // Cleanup interval on unmount
    useEffect(() => {
        return () => stopInterval();
    }, []);

    const stopInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
        intervalRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handlePause = () => {
        stopInterval();
        setIsPaused(true);
        setDistractions(prev => prev + 1);
    };

    const handleReset = () => {
        stopInterval();
        setIsActive(false);
        setIsPaused(false);
        setTimer(initialDuration);
        setTimer(initialDuration);
        setDistractions(0);
    };

    const handleFinish = () => {
        stopInterval();
        setIsActive(false);
        setIsPaused(false);

        // Calculate duration spent (Initial - Remaining)
        const duration = initialDuration - timer;

        // Save to DB
        addTimerRecord(duration, category, distractions);

        // Show Modal
        setLastSession({ duration, category, distractions });
        setModalVisible(true);

        // Reset Timer for next round
        setTimer(initialDuration);
        setDistractions(0);
    };

    const adjustTime = (minutes: number) => {
        setInitialDuration(prev => {
            const newDuration = Math.max(5 * 60, prev + minutes * 60); // Minimum 5 minutes
            setTimer(newDuration);
            return newDuration;
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <SessionSummaryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                data={lastSession}
            />

            <View style={styles.timerContainer}>
                {/* Main Timer Display/Button */}
                {/* Main Timer Display/Button */}


                {!isActive ? (
                    <View style={styles.setupContainer}>
                        <View style={styles.setupRow}>
                            {/* Minus Button */}
                            <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(-5)}>
                                <Text style={styles.adjustButtonText}>-5</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={handleStart}>
                                <Text style={styles.buttonText}>Başlat</Text>
                                <Text style={styles.timeText}>{formatTime(timer)}</Text>
                            </TouchableOpacity>

                            {/* Plus Button */}
                            <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTime(5)}>
                                <Text style={styles.adjustButtonText}>+5</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.categoryContainer}>
                            <CategoryPicker
                                selectedCategory={category}
                                onSelectCategory={setCategory}
                            />
                        </View>
                    </View>
                ) : (
                    // Active State
                    <View style={styles.activeControls}>
                        {/* Circle Display - changes color if paused */}
                        <View style={[styles.timerDisplay, isPaused ? styles.timerDisplayPaused : styles.timerDisplayRunning]}>
                            <Text style={styles.timerDisplayText}>{formatTime(timer)}</Text>
                            {distractions > 0 && <Text style={styles.distractionCountText}>Dikkat Dağınıklığı: {distractions}</Text>}
                        </View>

                        <View style={styles.controlsRow}>
                            {!isPaused ? (
                                <>
                                    <TouchableOpacity style={[styles.controlButton, styles.buttonPause]} onPress={handlePause}>
                                        <Text style={styles.controlButtonText}>Duraklat</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.controlButton, styles.buttonFinish]} onPress={handleFinish}>
                                        <Text style={styles.controlButtonText}>Bitir</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.pausedControlsColumn}>
                                        <TouchableOpacity style={[styles.controlButton, styles.buttonContinue]} onPress={handleStart}>
                                            <Text style={styles.controlButtonText}>Devam Et</Text>
                                        </TouchableOpacity>

                                        <View style={styles.secondaryControlsRow}>
                                            <TouchableOpacity style={[styles.controlButton, styles.buttonFinish]} onPress={handleFinish}>
                                                <Text style={styles.controlButtonText}>Bitir</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={[styles.controlButton, styles.buttonReset]} onPress={handleReset}>
                                                <Text style={styles.controlButtonText}>Sıfırla</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 20,
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    setupContainer: {
        alignItems: 'center',
        width: '100%',
    },
    categoryContainer: {
        marginTop: 40,
        width: '100%',
    },
    setupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    adjustButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    adjustButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonStart: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    timeText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 36,
        fontWeight: '200',
    },

    // Active State Styles
    activeControls: {
        alignItems: 'center',
    },
    timerDisplay: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 4,
    },
    timerDisplayRunning: {
        backgroundColor: '#FFFFFF',
        borderWidth: 4,
        borderColor: '#4CAF50',
    },
    timerDisplayPaused: {
        backgroundColor: '#FFF9C4', // Light Yellow
        borderWidth: 4,
        borderColor: '#FFC107', // Amber
    },
    timerDisplayText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
    distractionCountText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    pausedControlsColumn: {
        alignItems: 'center',
        gap: 15,
    },
    secondaryControlsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    controlButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        minWidth: 100,
        alignItems: 'center',
        elevation: 2,
    },
    buttonPause: {
        backgroundColor: '#FFC107',
        width: 150,
    },
    buttonContinue: {
        backgroundColor: '#4CAF50',
        width: 200,
        paddingVertical: 15,
    },
    buttonReset: {
        backgroundColor: '#E0E0E0',
    },
    buttonFinish: {
        backgroundColor: '#2196F3', // Blue
    },
    controlButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

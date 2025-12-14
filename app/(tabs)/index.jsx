import { StyleSheet, View } from 'react-native';
import TimerButton from '../../components/TimerButton';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <TimerButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
});

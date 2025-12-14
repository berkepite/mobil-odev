import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Proje', 'Kitap Okuma'];

export default function CategoryPicker({ selectedCategory, onSelectCategory, disabled }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Kategori Seçin:</Text>
            <View style={styles.categoriesGroup}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.chip,
                            selectedCategory === cat && styles.chipSelected,
                            disabled && styles.chipDisabled
                        ]}
                        onPress={() => !disabled && onSelectCategory(cat)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedCategory === cat && styles.chipTextSelected
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center', // Center the label and group
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15, // Increased spacing
        color: '#333',
    },
    categoriesGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10, // Uses gap for spacing between chips
    },
    chip: {
        paddingHorizontal: 20, // Slightly larger touch target
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
    },
    chipSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    chipDisabled: {
        opacity: 0.5,
    },
    chipText: {
        fontSize: 14,
        color: '#333',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

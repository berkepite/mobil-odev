import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Proje', 'Kitap Okuma'];

interface CategoryPickerProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    disabled?: boolean;
}

export default function CategoryPicker({ selectedCategory, onSelectCategory, disabled }: CategoryPickerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    scrollContent: {
        paddingRight: 20,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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

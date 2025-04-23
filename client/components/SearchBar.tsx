import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
}

const SearchBar = ({ 
    placeholder = "Search...", 
    value, 
    onChangeText 
}: SearchBarProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[
            styles.container,
            { 
              backgroundColor: isDark ? '#333' : '#f0f0f5',
              borderColor: isDark ? '#444' : '#e0e0e5',
            }
          ]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={isDark ? '#999' : '#666'} 
            />
            <TextInput
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000' }
              ]}
              placeholder={placeholder}
              placeholderTextColor={isDark ? '#999' : '#666'}
              value={value}
              onChangeText={onChangeText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16, 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        marginBottom: 16,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        marginLeft: 8, 
    }
});

export default SearchBar;
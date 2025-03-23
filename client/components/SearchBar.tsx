import React from 'react';
import { View, TextInput } from 'react-native';
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
    <View className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
      style={{ 
        backgroundColor: isDark ? '#333' : '#f0f0f5',
        borderWidth: 1,
        borderColor: isDark ? '#444' : '#e0e0e5',
      }}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isDark ? '#999' : '#666'} 
      />
      <TextInput
        className="flex-1 ml-2"
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#999' : '#666'}
        style={{ color: isDark ? '#fff' : '#000' }}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default SearchBar;
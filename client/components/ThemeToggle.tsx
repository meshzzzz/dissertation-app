import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Appearance } from 'react-native';

const ThemeToggle = () => {
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = isDark ? colors.primary : colors.primary;
  const backgroundColor = isDark ? '#2a2e37' : '#f0f0f0'; 
  const toggleBackgroundColor = isDark ? '#1a1d24' : '#ffffff'; 
  
  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <View className="px-5 py-2 w-full">
      <TouchableOpacity
        onPress={toggleTheme}
        className="relative w-16 h-8 rounded-full flex-row items-center justify-between overflow-hidden"
        style={{ backgroundColor: backgroundColor }}
      >
        <View 
          className={`absolute left-1.5 z-10 ${!isDark ? 'opacity-100' : 'opacity-40'}`}
        >
          <Ionicons
            name="sunny"
            size={15}
            color={!isDark ? primaryColor : '#ffffff'}
          />
        </View>
        
        <View 
          className={`absolute right-1.5 z-10 ${isDark ? 'opacity-100' : 'opacity-40'}`}
        >
          <Ionicons
            name="moon"
            size={15}
            color={isDark ? primaryColor : '#aaaaaa'}
          />
        </View>
        
        <View
          className={`absolute h-6 w-6 rounded-full ${
            isDark ? 'right-1' : 'left-1'
          }`}
          style={{ 
            backgroundColor: toggleBackgroundColor,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ThemeToggle;
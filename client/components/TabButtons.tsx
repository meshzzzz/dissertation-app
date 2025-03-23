import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export interface TabOption {
  id: string;
  label: string;
}

interface TabButtonsProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabButtons = ({ 
  options, 
  activeTab, 
  onTabChange 
}: TabButtonsProps) => {
  const colorScheme = useColorScheme();
  const secondaryColor = Colors[colorScheme ?? 'light'].secondary;

  return (
    <View className="flex-row justify-center mb-4">
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          className={`rounded-full px-5 py-2 ${index < options.length - 1 ? 'mr-5' : ''}`}
          style={{ 
            backgroundColor: activeTab === option.id 
              ? secondaryColor 
              : 'transparent',
            borderWidth: activeTab === option.id ? 0 : 1,
            borderColor: secondaryColor
          }}
          onPress={() => onTabChange(option.id)}
        >
          <Text
            style={{ 
              color: activeTab === option.id 
                ? '#fff' 
                : secondaryColor
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabButtons;
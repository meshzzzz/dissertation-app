import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            {options.map((option, index) => (
                <TouchableOpacity
                    key={option.id}
                    style={[
                        styles.tabButton,
                        index < options.length - 1 && styles.marginRight,
                        { 
                            backgroundColor: activeTab === option.id 
                                ? secondaryColor 
                                : 'transparent',
                            borderWidth: activeTab === option.id ? 0 : 1,
                            borderColor: secondaryColor
                        }
                    ]}
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16, 
    },
    tabButton: {
        borderRadius: 9999, 
        paddingHorizontal: 20, 
        paddingVertical: 8, 
    },
    marginRight: {
        marginRight: 20,
    }
});

export default TabButtons;
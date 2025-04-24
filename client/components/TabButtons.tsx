import React from 'react';
import { View, StyleSheet } from 'react-native';
import PillButton from './PillButton';

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
    return (
        <View style={styles.container}>
            {options.map((option, index) => (
                <PillButton
                    key={option.id}
                    label={option.label}
                    isActive={activeTab === option.id}
                    onPress={() => onTabChange(option.id)}
                    marginRight={index < options.length - 1}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    }
});
export default TabButtons;
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Appearance } from 'react-native';
import Toggle from './Toggle';

const ThemeToggle = () => {
    const colorScheme = useColorScheme();
    const { colors } = useTheme();
    const [isDark, setIsDark] = useState(colorScheme === 'dark');
    const primaryColor = colors.primary;

    useEffect(() => {
        setIsDark(colorScheme === 'dark');
    }, [colorScheme]);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        Appearance.setColorScheme(newTheme);
        setIsDark(!isDark);
    };

    return (
        <View style={styles.container}>
            <Toggle
                isActive={isDark}
                onToggle={toggleTheme}
                leftIcon={
                    <Ionicons
                        name="sunny"
                        size={15}
                        color={!isDark ? primaryColor : '#ffffff'}
                    />
                }
                rightIcon={
                    <Ionicons
                        name="moon"
                        size={15}
                        color={isDark ? primaryColor : '#aaaaaa'}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        width: '100%'
    }
});

export default ThemeToggle;
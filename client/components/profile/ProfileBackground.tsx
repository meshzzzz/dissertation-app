import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const ProfileBackground= () => {
    const colorScheme = useColorScheme();
    const middleBgColor = Colors[colorScheme ?? 'light'].profile.middleBackground;

    return (
        <>
            {/* middle light blue section (from middle of profile pic to posts section) */}
            <View 
                style={[
                    styles.middleBackground, 
                    { backgroundColor: middleBgColor, zIndex: -2 }]} 
            />
        </>
    );
};

const styles = StyleSheet.create({
    middleBackground: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        height: 370,
    },
});

export default ProfileBackground;
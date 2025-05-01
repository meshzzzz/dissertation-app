import React from 'react';
import { DrawerToggleButton } from '@react-navigation/drawer';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function DrawerToggle() {
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;
  
    return <DrawerToggleButton tintColor={primaryColor} />;
}
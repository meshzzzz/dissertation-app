import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@react-navigation/native'

export default function DrawerLayout() {
    const { colors } = useTheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer 
                drawerContent={CustomDrawerContent} 
                screenOptions={{
                    drawerHideStatusBarOnOpen: true,
                    drawerActiveBackgroundColor: colors.card,
                    drawerActiveTintColor: colors.primary,
                }}>
                <Drawer.Screen 
                    name='(tabs)' 
                    options={{
                        drawerLabel: 'Home',
                        headerTitle: 'Home',
                        drawerIcon: ({ size, color}) => (
                            <Ionicons name='home' size={size} color={color} /> 
                        )
                    }}
                />
                <Drawer.Screen 
                    name='settings' 
                    options={{
                        drawerLabel: 'Settings',
                        headerTitle: 'Settings',
                        drawerIcon: ({ size, color}) => (
                            <Ionicons name='settings' size={size} color={color} /> 
                        )
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
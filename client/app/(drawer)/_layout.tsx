import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@react-navigation/native'
import DrawerToggle from '@/components/DrawerToggle';

export default function DrawerLayout() {
    const { colors } = useTheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer 
                drawerContent={(props) => <CustomDrawerContent {...props} />} 
                screenOptions={{
                    drawerHideStatusBarOnOpen: true,
                    drawerActiveBackgroundColor: colors.card,
                    drawerActiveTintColor: colors.primary,
                    headerShown: false,
                }}>
                <Drawer.Screen 
                    name='(tabs)' 
                    options={{
                        drawerLabel: 'Home',
                        drawerIcon: ({ size, color}) => (
                            <Ionicons name='home' size={size} color={color} /> 
                        )
                    }}
                />
                <Drawer.Screen 
                    name='about' 
                    options={{
                        drawerLabel: 'About',
                        headerTitle: 'About',
                        headerLeft: () => <DrawerToggle />,
                        headerLeftContainerStyle: {
                            paddingLeft: 16,
                        },
                        headerShown: true,
                        headerShadowVisible: false,
                        drawerIcon: ({ size, color}) => (
                            <Ionicons name='information-circle-outline' size={size} color={color} /> 
                        )
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
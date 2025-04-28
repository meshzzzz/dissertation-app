import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function GroupsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen 
                name="index" 
                options={{ 
                    title: 'Groups', 
                    headerLeft: () => <DrawerToggleButton />
                }} 
            />
            <Stack.Screen 
                name="[id]" 
                options={{ 
                    title: '',
                    headerBackTitle: "Groups"
                }}  
            />
        </Stack>
    );
}

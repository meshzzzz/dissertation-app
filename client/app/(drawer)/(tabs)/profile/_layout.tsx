import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import BackButton from '@/components/BackButton';

export default function ProfileLayout() {
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
                    title: 'My Profile', 
                    headerLeft: () => <DrawerToggleButton />
                }} 
            />
            <Stack.Screen 
                name="posts/[id]" 
                options={{ 
                    title: 'Post',
                    headerLeft: () => <BackButton />
                }}  
            />
        </Stack>
    );
}

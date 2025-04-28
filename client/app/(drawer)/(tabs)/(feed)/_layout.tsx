import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import BackButton from '@/components/BackButton';

export default function FeedLayout() {
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
                    title: 'Feed', 
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

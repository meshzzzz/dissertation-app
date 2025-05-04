import { Stack } from 'expo-router';
import DrawerToggle from '@/components/DrawerToggle';
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
                    headerLeft: () => <DrawerToggle />
                }} 
            />
            <Stack.Screen 
                name="posts/[id]" 
                options={{ 
                    title: 'Post',
                    headerLeft: () => <BackButton />
                }}  
            />
            <Stack.Screen
                name="events/[id]"
                options={{
                    title: 'Event',
                    headerLeft: () => <BackButton />
                }}
            />
        </Stack>
    );
}

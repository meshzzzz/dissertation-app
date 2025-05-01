import { Stack } from 'expo-router';
import DrawerToggle from '@/components/DrawerToggle';
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
        </Stack>
    );
}

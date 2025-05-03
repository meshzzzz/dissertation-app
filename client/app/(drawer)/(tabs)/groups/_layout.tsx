import { Stack } from 'expo-router';
import DrawerToggle from '@/components/DrawerToggle';
import BackButton from '@/components/BackButton';

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
                    headerLeft: () => <DrawerToggle />
                }} 
            />
            <Stack.Screen 
                name="[id]" 
                options={{ 
                    title: '',
                    headerLeft: () => <BackButton />
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
                name="groupchat"
                options={{
                    title: 'Groupchat',
                    headerLeft: () => <BackButton />
                }}
            />
            <Stack.Screen
                name="members"
                options={{
                    title: 'Members',
                    headerLeft: () => <BackButton />
                }}
            />
            <Stack.Screen
                name="eventslist"
                options={{
                    title: 'Events',
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

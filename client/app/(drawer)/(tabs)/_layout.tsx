import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { DrawerToggleButton } from '@react-navigation/drawer';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
}) {
    return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { authState } = useAuth();

    if (!authState?.authenticated) {
        return <Redirect href="/auth/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
                tabBarShowLabel: false,
                headerLeft: () => <DrawerToggleButton />,
                headerShown: true,
                headerShadowVisible: false,
                tabBarStyle: {
                    borderTopWidth: 0,
                    paddingHorizontal: 35,
                    height: 80,
                },
                tabBarItemStyle: {
                    paddingTop: 12,
                }
            }}>
            <Tabs.Screen
                name="(feed)"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="groups"
                options={{
                    title: 'Groups',
                    tabBarIcon: ({ color }) => <TabBarIcon name="people-outline" color={color} />,
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="your-uni"
                options={{
                    title: 'Your University',
                    tabBarIcon: ({ color }) => <TabBarIcon name="school-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'My Profile',
                    tabBarIcon: ({ color }) => <TabBarIcon name="person-outline" color={color} />,
                    headerShown: false
                }}
            />
        </Tabs>
    );
}

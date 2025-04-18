import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, Redirect } from 'expo-router';
import { Pressable } from 'react-native';
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
        },
        tabBarItemStyle: {
            paddingTop: 10,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups/index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <TabBarIcon name="people-outline" color={color} />,
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
        }}
      />
      <Tabs.Screen
        name="groups/[id]"
        options={{
            title: 'Group',
            href:null,}}
      />
    </Tabs>
  );
}

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Import our reusable components
import SearchBar from '@/components/SearchBar';
import TabButtons, { TabOption } from '@/components/TabButtons';
import GroupCard from '@/components/GroupCard';

interface Group {
  id: string;
  name: string;
  membersCount: number;
  backgroundColor: string;
}

export default function GroupsScreen() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { authState } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Define tab options
  const tabOptions: TabOption[] = [
    { id: 'my', label: 'My Groups' },
    { id: 'all', label: 'All Groups' }
  ];

  // Define an array of background colors for groups
  const groupBackgroundColors = [
    '#5E35B1', // Deep Purple
    '#1E88E5', // Blue
    '#43A047', // Green
    '#E53935', // Red
    '#FB8C00', // Orange
    '#8E24AA', // Purple
    '#3949AB', // Indigo
    '#039BE5', // Light Blue
  ];

  // Create mock data with color backgrounds
  const groups: Group[] = [
    { id: '1', name: 'QMUL', membersCount: 2930, backgroundColor: groupBackgroundColors[0] },
    { id: '2', name: 'Accomodation', membersCount: 780, backgroundColor: groupBackgroundColors[1] },
    { id: '3', name: 'Whitechapel', membersCount: 966, backgroundColor: groupBackgroundColors[2] },
    { id: '4', name: 'Mile End', membersCount: 1545, backgroundColor: groupBackgroundColors[3] },
    { id: '5', name: 'Walking', membersCount: 206, backgroundColor: groupBackgroundColors[4] },
    { id: '6', name: 'London Days Out', membersCount: 1577, backgroundColor: groupBackgroundColors[5] },
    { id: '7', name: 'LGBTQ+', membersCount: 968, backgroundColor: groupBackgroundColors[6] },
    { id: '8', name: 'Music', membersCount: 775, backgroundColor: groupBackgroundColors[7] },
  ];
  
  async function getData() {
    if (authState?.token) {
      try {
        const response = await axios.post(`${API_URL}/userdata`, {
          token: authState.token
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  }

  useEffect(() => {
    getData();
  }, [authState]);

  // Function to handle navigation with error handling
  const handleGroupPress = (groupId: string) => {
    try {
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1" >
      <View className="flex-1 px-4">
        
        {/* Search Bar Component */}
        <SearchBar 
          placeholder="Search Groups.."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Tab Buttons Component */}
        <TabButtons 
          options={tabOptions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Groups Grid */}
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="flex-row flex-wrap justify-between">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                membersCount={group.membersCount}
                backgroundColor={group.backgroundColor}
                onPress={handleGroupPress}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
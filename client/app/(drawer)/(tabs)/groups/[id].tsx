import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  View as DefaultView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import { API_URL, useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import axios from 'axios';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface GroupDetail {
  id: string;
  name: string;
  membersCount: number;
  description: string;
  nextEventTitle: string;
  nextEventDate: string;
  nextEventLocation: string;
  nextEventDaysToGo: number;
  onlineCount: number;
  admins: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  timeAgo: string;
  author: string;
}

export default function GroupDetailScreen() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams();
  const groupId = params.id as string;
  const router = useRouter();
  const { authState } = useAuth();
  
  const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;
  const primaryColor = Colors[colorScheme ?? 'light'].primary;
  const secondaryColor = Colors[colorScheme ?? 'light'].secondary;

  const [groupData, setGroupData] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authState?.token) {
        try {
          // mock data for development
          const mockGroupData: GroupDetail = {
            id: groupId,
            name: 'Walking',
            membersCount: 206,
            description: 'Welcome to the QLink Walking Group! Get involved with our walking meetups & find great routes to take on your own.',
            nextEventTitle: 'Whitechapel Walk',
            nextEventDate: '27th Jan • 1pm',
            nextEventLocation: 'Whitechapel',
            nextEventDaysToGo: 7,
            onlineCount: 32,
            admins: [
              { id: '1', name: 'Robbie', avatar: 'robbiepic' },
              { id: '2', name: 'Clara', avatar: 'clarapic' }
            ]
          };
          
          setGroupData(mockGroupData);
          
          // mock posts
          const mockPosts: Post[] = [
            {
              id: '1',
              title: 'Weekend walk at Richmond Park!',
              content: 'I spent this Saturday looking around this beautiful Royal Park - got lost several times and wore entirely inappropriate footwear... but saw the deer!',
              timeAgo: '4 hours ago',
              author: 'Robbie'
            }
          ];
          
          setPosts(mockPosts);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching group data:", error);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [groupId, authState]);

  const handlePostPress = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  if (loading || !groupData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
        <Stack.Screen 
            options={{
                title: groupData?.name,
            }} 
      />
      <ScrollView className="flex-1">
        {/* pinboard section */}
        <View className="m-4 rounded-3xl overflow-hidden" style={{ backgroundColor: pinboardColor }}>
          <DefaultView className="p-5" style={{ backgroundColor: 'transparent' }}>
            {/*gGroup title and pin image */}
            <DefaultView className="flex-row items-center mb-4" style={{ backgroundColor: 'transparent' }}>
              <Text className="text-4xl font-bold" style={{ color: colorScheme === 'dark' ? '#FFF' : '#000' }}>
                {groupData.name}
              </Text>
              <DefaultView className="flex-1" style={{ backgroundColor: 'transparent' }} />
              <Image 
                source={{ uri: 'https://placekitten.com/100/100' }} 
                className="w-16 h-16 rounded" 
                style={{ opacity: 0.9 }}
              />
            </DefaultView>
            
            {/* group info section */}
            <DefaultView className="flex-row" style={{ backgroundColor: 'transparent' }}>
              {/* left side - description */}
              <DefaultView className="flex-1 mr-2 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,192,203,0.7)' }}>
                <Text className="text-sm" style={{ color: '#000' }}>
                  {groupData.description}
                </Text>
                <DefaultView className="absolute -top-1 -left-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#1a1a4a' }} />
              </DefaultView>
              
              {/* right side - stacked info */}
              <DefaultView className="w-2/5" style={{ backgroundColor: 'transparent' }}>
                {/* group members count */}
                <DefaultView className="p-2 border-2 border-black mb-2 rounded bg-white">
                  <Text className="text-center font-bold">{groupData.membersCount} Members</Text>
                </DefaultView>
                
                {/* next event */}
                <DefaultView className="bg-white border-2 border-black rounded p-2">
                  <Text className="text-center font-bold mb-1">Next Event</Text>
                  <Image 
                    source={{ uri: 'https://placekitten.com/200/100' }} 
                    className="w-full h-16 mb-2"
                  />
                  <Text className="text-center">{groupData.nextEventTitle}</Text>
                  <Text className="text-center text-xs">{groupData.nextEventDate}</Text>
                  <DefaultView className="flex-row justify-center items-center mt-1" style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-3xl font-bold">{groupData.nextEventDaysToGo}</Text>
                    <Text className="text-xs ml-1">days to go</Text>
                  </DefaultView>
                </DefaultView>
              </DefaultView>
            </DefaultView>
            
            {/* admins section */}
            <DefaultView className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#FFFF88' }}>
              <Text className="text-center font-bold mb-2">Admins</Text>
              <DefaultView className="absolute -top-1 -left-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#1a1a4a' }} />
              
              {groupData.admins.map((admin) => (
                <DefaultView key={admin.id} className="flex-row items-center mb-2" style={{ backgroundColor: 'transparent' }}>
                  <Image source={{ uri: admin.avatar }} className="w-8 h-8 rounded-full" />
                  <Text className="ml-2">{admin.name}</Text>
                  <Text className="ml-1">{'>'}</Text>
                </DefaultView>
              ))}
            </DefaultView>
            
            {/* online users indicator */}
            <Text className="text-right mt-2 text-green-700">• {groupData.onlineCount} online</Text>
          </DefaultView>
        </View>
        
        {/* buttons section */}
        <DefaultView className="flex-row justify-between px-4 mb-4">
          <TouchableOpacity 
            className="flex-1 mr-2 py-3 rounded-full flex-row justify-center items-center"
            style={{ backgroundColor: secondaryColor }}
            onPress={() => router.push(`/groups/${groupId}/contact`)}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text className="text-white ml-2 font-medium">Contact Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 ml-2 py-3 rounded-full flex-row justify-center items-center"
            style={{ backgroundColor: primaryColor }}
            onPress={() => router.push(`/groups/${groupId}/chat`)}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text className="text-white ml-2 font-medium">Groupchat</Text>
          </TouchableOpacity>
        </DefaultView>
        
        {/* posts section */}
        <View className="mx-4 mb-20">
          {posts.map((post) => (
            <TouchableOpacity 
              key={post.id} 
              className="mb-4 p-4 rounded-xl"
              style={{ 
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f8f8',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
              onPress={() => handlePostPress(post.id)}
            >
              <Text className="text-lg font-bold mb-1">{post.title}</Text>
              <Text className="text-gray-500 text-xs mb-2">{post.timeAgo}</Text>
              <Text className="mb-3">{post.content}</Text>
              
              <DefaultView className="flex-row justify-end" style={{ backgroundColor: 'transparent' }}>
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full justify-center items-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                >
                  <Ionicons name="heart-outline" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full justify-center items-center ml-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                </TouchableOpacity>
              </DefaultView>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity
        className="absolute right-6 w-16 h-16 rounded-full justify-center items-center"
        style={{ 
          bottom: 32,
          backgroundColor: secondaryColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5
        }}
        onPress={() => router.push(`/groups/${groupId}/create-post`)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
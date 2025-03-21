import { SafeAreaView, TouchableOpacity, Image, View as DefaultView, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import UploadModal from '@/components/UploadModal';

interface Post {
    id: number;
    title: string;
    date: string;
    time: string;
    tag: string;
  }

export default function ProfileScreen() {
    const { authState } = useAuth();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const tintColor = Colors[colorScheme ?? 'light'].primary;
    const middleBgColor = Colors[colorScheme ?? 'light'].profile.middleBackground;
    const bottomBgColor = Colors[colorScheme ?? 'light'].profile.bottomBackground;
    const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;
    const [modalVisible, setModalVisible] = useState(false);
const [uploadLoading, setUploadLoading] = useState(false);
const [profileImage, setProfileImage] = useState({ uri: "https://placekitten.com/300/300" });
    const [userData, setUserData] = useState<{
        name: string;
        program: string;
        aboutMe: string;
        location: {
          country: string;
          campus: string;
          accomodation: string;
        };
        posts: Post[]; 
      }>({
        name: 'Loading...',
        program: '',
        aboutMe: '',
        location: {
          country: '',
          campus: '',
          accomodation: ''
        },
        posts: []
      });
    const [loading, setLoading] = useState(true);

    async function getData() {
        if (authState?.token) {
            setLoading(true);
            try {
              const response = await axios.post(`${API_URL}/userdata`, {
                token: authState.token
              });
              console.log(response.data);
              setUserData({
                name: response.data?.name || 'Robert Pattinson',
                program: response.data?.program || '2nd Year Biology BSc',
                aboutMe: response.data?.aboutMe || "Hi I'm Rob, looking for friends who like Biology, baking & walking.",
                location: {
                  country: response.data?.country || 'UK',
                  campus: response.data?.campus || 'Mile End',
                  accomodation: response.data?.residence || 'Maurice Court'
                },
                posts: response.data?.posts || [
                  { id: 1, title: 'Skeleton Cats?', date: '1st Jan', time: '3am', tag: 'Mile End' },
                  { id: 2, title: 'Kikuo concert...', date: '7th Feb', time: '2:43pm', tag: 'Vocaloid' },
                  { id: 3, title: 'Do I look like the guy...', date: '23rd Mar', time: '11pm', tag: 'Film' }
                ]
              });
            } catch (error) {
              console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
          }
    }

    useEffect(() => {
        getData();
    }, [authState]);

    const handleCameraUpload = async () => {
        try {
            setUploadLoading(true);
            
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Camera permission is required');
                setUploadLoading(false);
                return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
            
            if (!result.canceled) {
                setProfileImage({ uri: result.assets[0].uri });
                // You can add code to upload to your server here
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        } finally {
            setUploadLoading(false);
            setModalVisible(false);
        }
    };
    
    const handleGalleryUpload = async () => {
        try {
            setUploadLoading(true);
            
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Gallery permission is required');
                setUploadLoading(false);
                return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
            
            if (!result.canceled) {
                setProfileImage({ uri: result.assets[0].uri });
                // You can add code to upload to your server here
            }
        } catch (error) {
            console.error('Error selecting photo:', error);
        } finally {
            setUploadLoading(false);
            setModalVisible(false);
        }
    };
    
    const handleRemoveImage = () => {
        // Reset to default image
        setProfileImage({ uri: "https://placekitten.com/300/300" });
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScrollView className="flex-1">
                <View className="items-center pb-10 relative">
                    {/* background sections - scroll with content */}
                    {/* middle light blue section (from middle of profile pic to posts section) */}
                    <DefaultView 
                        className="absolute top-[90px] left-0 right-0 h-[370px]" 
                        style={{ backgroundColor: middleBgColor, zIndex: -2 }} 
                    />
                    
                    {/* bottom darker blue section (posts section) */}
                    <DefaultView 
                        className="absolute top-[460px] left-0 right-0 bottom-0" 
                        style={{ backgroundColor: bottomBgColor, zIndex: -2 }} 
                    />
    
                    {/* profile picture */}
                    <View className="mt-5 mb-4">
                        <View className="w-52 h-52 rounded-full justify-center items-center" 
                            style={{ 
                                borderWidth: 6, 
                                borderColor: accentColor,
                                backgroundColor: colors.background ,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                                elevation: 3 
                            }}>
                            <Image
                                source={profileImage}
                                className="w-44 h-44 rounded-full"
                            />
                        </View>
                        <TouchableOpacity 
                            className="absolute right-2 bottom-2 w-10 h-10 rounded-full justify-center items-center"
                            style={{ 
                                backgroundColor: colors.background,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                                elevation: 3 
                            }}
                            onPress={() => setModalVisible(true)}>
                            <Ionicons name="pencil" size={22} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* user info */}
                    <Text className="text-3xl font-bold mb-1">{userData.name}</Text>
                    <Text className="text-lg mb-5">{userData.program}</Text>

                    {/* about me pin-board */}
                    <View className="w-4/5 rounded-3xl p-5 mb-8"
                            style={{ backgroundColor: pinboardColor }}>
                        <Text className="text-lg font-bold mb-2"
                              style={{ color: colorScheme === 'dark' ? '#FFF' : '#000' }}>
                            About me
                        </Text>
                        <Text className="text-base mb-4"
                              style={{ color: colorScheme === 'dark' ? '#EEE' : '#000' }}>
                            {userData.aboutMe}
                        </Text>

                        {/* location info */}
                        <View className="flex-row justify-around mt-2">
                            {userData.location.country && (
                                <View className="flex-row items-center">
                                <FontAwesome name="flag" size={16} color="#333" />
                                <Text className="ml-1">{userData.location.country}</Text>
                                </View>
                            )}
                            
                            {userData.location.campus && (
                                <View className="flex-row items-center">
                                <FontAwesome name="university" size={16} color="#333" />
                                <Text className="ml-1">{userData.location.campus}</Text>
                                </View>
                            )}
                            
                            {userData.location.accomodation && (
                                <View className="flex-row items-center">
                                <MaterialIcons name="apartment" size={16} color="#333" />
                                <Text className="ml-1">{userData.location.accomodation}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* posts section */}
                    <View className="w-full px-5 pt-6 pb-8">
                        <Text className="text-2xl font-bold mb-6 self-start" style={{ color: '#fff' }}>My posts</Text>
                        <ScrollView 
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 20 }}
                            className="w-full"
                        >
                            {userData.posts.map((post, index) => (
                                <TouchableOpacity 
                                    key={post.id} 
                                    className="mr-4 rounded-xl p-4 min-h-[180px] flex flex-col justify-between"
                                    style={{ 
                                        backgroundColor: colors.background,
                                        width: 220,
                                    }}>
                                    <View style={{ backgroundColor: 'transparent' }}>
                                        <Text className="text-lg font-bold">{post.title}</Text>
                                        <Text className="text-xs text-gray-500 mt-2">{post.date} • {post.time}</Text>
                                    </View>
                                    <View className="rounded-full px-3 py-1 self-start mt-4"
                                        style={{ backgroundColor: accentColor }}>
                                        <Text className="text-xs text-white">{post.tag}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>

            <UploadModal 
                modalVisible={modalVisible}
                onBackPress={() => setModalVisible(false)}
                onCameraPress={handleCameraUpload}
                onGalleryPress={handleGalleryUpload}
                onRemovePress={handleRemoveImage}
                isLoading={uploadLoading}
                hasExistingImage={profileImage.uri !== "https://placekitten.com/300/300"}
            />
        </SafeAreaView>
    );
}



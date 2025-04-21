import { SafeAreaView, TouchableOpacity, Image, View as DefaultView, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import UploadModal from '@/components/profile/UploadModal';
import EditProfileModal from '@/components/profile/EditProfileModal';

interface Post {
    id: number;
    title: string;
    date: string;
    time: string;
    tag: string;
  }

export default function Profile() {
    const { authState } = useAuth();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const tintColor = Colors[colorScheme ?? 'light'].primary;
    const middleBgColor = Colors[colorScheme ?? 'light'].profile.middleBackground;
    const bottomBgColor = Colors[colorScheme ?? 'light'].profile.bottomBackground;
    const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;
    const [pfpModalVisible, setPfpModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [profileImage, setProfileImage] = useState({ uri: "https://placekitten.com/300/300" });
    const [userData, setUserData] = useState<{
        name: string;
        program: string;
        aboutMe: string;
        widgets: {
          country: string;
          campus: string;
          accomodation: string;
        };
        posts: Post[]; 
      }>({
        name: 'Loading...',
        program: '',
        aboutMe: '',
        widgets: {
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

                let yearOfStudy = "";
                if (response.data?.data?.yearOfEntry) {
                    const entryYear = parseInt(response.data.data.yearOfEntry);
                    const currentYear = new Date().getFullYear();
                    const yearsStudying = currentYear - entryYear;
                    
                    // Create ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
                    let suffix = "th";
                    if (yearsStudying === 1) suffix = "st";
                    else if (yearsStudying === 2) suffix = "nd";
                    else if (yearsStudying === 3) suffix = "rd";
                    
                    yearOfStudy = `${yearsStudying}${suffix} Year `;
                }

                setUserData({
                    name: response.data?.data?.preferredName || 'Robert Pattinson',
                    program: response.data?.data?.courseOfStudy 
                        ? `${yearOfStudy}${response.data.data.courseOfStudy}`
                        : '2nd Year Biology BSc',
                    aboutMe: response.data?.data?.aboutMe || "Hi I'm Rob, looking for friends who like Biology, baking & walking.",
                    widgets: {
                        country: response.data?.data?.country || 'UK',
                        campus: response.data?.data?.campus || 'Mile End',
                        accomodation: response.data?.data?.accomodation || 'Maurice Court'
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

    const handleProfileUpdate = () => {
        getData(); // refresh profile data
    }

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
                // add code to upload to server here
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        } finally {
            setUploadLoading(false);
            setPfpModalVisible(false);
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
                // add code to upload to  server here
            }
        } catch (error) {
            console.error('Error selecting photo:', error);
        } finally {
            setUploadLoading(false);
            setPfpModalVisible(false);
        }
    };
    
    const handleRemoveImage = () => {
        // reset to default image
        setProfileImage({ uri: "https://placekitten.com/300/300" });
        setPfpModalVisible(false);
    };

    return (
        <SafeAreaView style={[styles.container,{ backgroundColor: colors.background }]}>
            <View style={styles.contentContainer}>
                {/* background sections - scroll with content */}
                {/* middle light blue section (from middle of profile pic to posts section) */}
                <DefaultView 
                    style={[
                        styles.middleBackground, 
                        { backgroundColor: middleBgColor, zIndex: -2 }]} 
                />
                
                {/* bottom darker blue section (posts section) */}
                <DefaultView 
                    style={[
                        styles.bottomBackground, 
                        { backgroundColor: bottomBgColor, zIndex: -2 }]} 
                />

                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setEditModalVisible(true)}>
                    <Ionicons name="pencil" size={24} color={'#578BBB'} />
                </TouchableOpacity>

                {/* profile picture */}
                <View style={styles.profilePictureContainer}>
                    <View style={[
                        styles.profilePictureFrame,
                        { 
                            borderWidth: 6, 
                            borderColor: accentColor,
                            backgroundColor: colors.background ,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            elevation: 3 
                        }
                    ]}>
                        <Image
                            source={profileImage}
                            style={styles.profilePicture}
                        />
                    </View>
                </View>

                {/* user info */}
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userProgram}>{userData.program}</Text>

                {/* about me pin-board */}
                <View style={[
                    styles.pinboard,
                    { backgroundColor: pinboardColor}
                    ]}>
                    
                        {/* pinboard corner dots */}
                    <View style={[
                        styles.cornerDot,
                        styles.topLeftDot,
                    ]} />
                    
                    <View style={[
                        styles.cornerDot,
                        styles.topRightDot,
                    ]} />
                    
                    <View style={[
                        styles.cornerDot,
                        styles.bottomLeftDot,
                    ]} />
                    
                    <View style={[
                        styles.cornerDot,
                        styles.bottomRightDot,
                    ]} />
                    
                    <View style={styles.pinboardContent}>
                        <Text style={[
                            styles.pinboardTitle,
                            { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                            About me
                        </Text>
                        <Text style={[
                            styles.pinboardText,
                            { color: colorScheme === 'dark' ? '#EEE' : '#000' }]}
                            numberOfLines={2}
                            ellipsizeMode='tail'
                        >
                            {userData.aboutMe}
                        </Text>

                        {/* location info */}
                        <View style={styles.locationContainer}>
                            {userData.widgets.country && (
                                <View style={styles.locationItem}>
                                <FontAwesome name="flag" size={14} color="#333" />
                                <Text style={styles.locationText}>{userData.widgets.country}</Text>
                                </View>
                            )}
                            
                            {userData.widgets.campus && (
                                <View style={styles.locationItem}>
                                <FontAwesome name="university" size={14} color="#333" />
                                <Text style={styles.locationText}>{userData.widgets.campus}</Text>
                                </View>
                            )}
                            
                            {userData.widgets.accomodation && (
                                <View style={styles.locationItem}>
                                <MaterialIcons name="apartment" size={14} color="#333" />
                                <Text style={styles.locationText}>{userData.widgets.accomodation}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* posts section */}
                <View style={styles.postsSection}>
                    <Text style={styles.postsSectionTitle}>My posts</Text>
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                        style={styles.postsScrollView}
                    >
                        {userData.posts.map((post, index) => (
                            <TouchableOpacity 
                                key={post.id} 
                                style={[
                                    styles.postCard,
                                    { backgroundColor: colors.background }
                                ]}>
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <Text style={styles.postTitle}>{post.title}</Text>
                                    <Text style={styles.postDate}>{post.date} • {post.time}</Text>
                                </View>
                                <View style={[
                                    styles.postTag,
                                    { backgroundColor: accentColor }]}>
                                    <Text style={styles.postTagText}>{post.tag}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <UploadModal 
                modalVisible={pfpModalVisible}
                onBackPress={() => setPfpModalVisible(false)}
                onCameraPress={handleCameraUpload}
                onGalleryPress={handleGalleryUpload}
                onRemovePress={handleRemoveImage}
                isLoading={uploadLoading}
                hasExistingImage={profileImage.uri !== "https://placekitten.com/300/300"}
            />

            <EditProfileModal
                modalVisible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                userData={{
                    name: userData.name,
                    aboutMe: userData.aboutMe,
                    widgets: userData.widgets,
                }}
                onUpdateSuccess={handleProfileUpdate}
                onPhotoEditRequest={() => {
                    setEditModalVisible(false);
                    setPfpModalVisible(true);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 40,
        position: 'relative',
    },
    middleBackground: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        height: 370,
    },
    bottomBackground: {
        position: 'absolute',
        top: 480,
        left: 0,
        right: 0,
        bottom: 20,
    },
    editButton: {
        position: 'absolute',
        top: 120,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    profilePictureContainer: {
        marginTop: 15,
        marginBottom: 16,
    },
    profilePictureFrame: {
        width: 190,
        height: 190,
        borderRadius: 100,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture: {
        width: 178,
        height: 178,
        borderRadius: 100,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userProgram: {
        fontSize: 15,
        marginBottom: 20,
    },
    pinboard: {
        position: 'relative',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        width: '90%',
        minHeight: 150,
        alignSelf: 'center',
    },
    cornerDot: {
        position: 'absolute',
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#C19259'
    },
    topLeftDot: {
        top: 15,
        left: 15,
    },
    topRightDot: {
        top: 15,
        right: 15,
    },
    bottomLeftDot: {
        bottom: 15,
        left: 15,
    },
    bottomRightDot: {
        bottom: 15,
        right: 15,
    },
    pinboardContent: {
        marginHorizontal: 20,
        marginVertical: 10,
    },
    pinboardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 4,
    },
    pinboardText: {
        fontSize: 12,
        marginBottom: 15,
        lineHeight: 22,
        height: 44,
        overflow: 'hidden',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    locationText: {
        marginLeft: 4,
        fontSize: 12,
    },
    postsSection: {
        width: '100%',
        paddingLeft: 20,
    },
    postsSectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 16,
        alignSelf: 'flex-start',
        color: '#fff',
    },
    postsScrollView: {
        width: '100%',
    },
    postCard: {
        marginRight: 16,
        borderRadius: 12,
        padding: 14,
        height: 125,
        width: 125,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    postDate: {
        fontSize: 10,
        color: '#888',
        marginTop: 8,
    },
    postTag: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 18,
    },
    postTagText: {
        fontSize: 10,
        color: '#fff',
    },
})



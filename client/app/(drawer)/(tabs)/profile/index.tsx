import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { useTheme } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import Popup from '@/components/Popup';
import ProfileHeader from '@/components/profile/ProfileHeader';
import Pinboard from '@/components/profile/Pinboard';
import PostsContainer from '@/components/profile/PostsContainer';

export default function Profile() {
    const { authState } = useAuth();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const middleBgColor = Colors[colorScheme ?? 'light'].profile.middleBackground;
    const [pfpModalVisible, setPfpModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [profileImage, setProfileImage] = useState({ uri: "https://placekitten.com/300/300" });
    const [notification, setNotification] = useState({
        visible: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });
    const [userData, setUserData] = useState<{
        name: string;
        program: string;
        aboutMe: string;
        widgets: {
          country: string;
          campus: string;
          accomodation: string;
        };
      }>({
        name: 'Loading...',
        program: '',
        aboutMe: '',
        widgets: {
          country: '',
          campus: '',
          accomodation: ''
        }
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
                    
                    // create ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
                    let suffix = "th";
                    if (yearsStudying === 1) suffix = "st";
                    else if (yearsStudying === 2) suffix = "nd";
                    else if (yearsStudying === 3) suffix = "rd";
                    
                    yearOfStudy = `${yearsStudying}${suffix} Year `;
                }

                // set profile image from Cloudinary
                if (response.data?.data?.profileImage) {
                    setProfileImage({ uri: response.data.data.profileImage });
                }

                setUserData({
                    name: response.data?.data?.preferredName || 'Anon',
                    program: response.data?.data?.courseOfStudy 
                        ? `${yearOfStudy}${response.data.data.courseOfStudy}`
                        : 'Not Set',
                    aboutMe: response.data?.data?.aboutMe || "Nice to meet you!",
                    widgets: {
                        country: response.data?.data?.country || 'Not Set',
                        campus: response.data?.data?.campus || 'Not Set',
                        accomodation: response.data?.data?.accomodation || 'Not Set'
                    },
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
        setNotification({
            visible: true,
            type: 'success',
            message: 'Profile updated successfully!'
        });
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

                // upload to server
                const formData = new FormData();
                
                // append the image
                const localUri = result.assets[0].uri;
                const filename = localUri.split('/').pop();
                const match = filename ? /\.(\w+)$/.exec(filename) : null;
                const type = match ? `image/${match[1]}` : 'image';
                
                formData.append('image', {
                    uri: localUri,
                    name: filename,
                    type
                } as any);
                
                // append the auth token
                formData.append('token', authState?.token || '');
                
                // make request to server
                const response = await axios.post(
                    `${API_URL}/profile-image`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                
                // handle response
                if (response.data.status === 'ok') {
                    // update profile image with Cloudinary URL
                    setProfileImage({ uri: response.data.data.profileImage });
                    // refresh user data
                    getData();
                    setNotification({
                        visible: true,
                        type: 'success',
                        message: 'Profile picture updated!'
                    });
                } else {
                    console.error('Upload failed:', response.data);
                    setNotification({
                        visible: true,
                        type: 'error',
                        message: 'Failed to upload image. Please try again.'
                    });
                }
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            setNotification({
                visible: true,
                type: 'error',
                message: 'Error taking photo. Please try again.'
            });
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

                // upload to server
                const formData = new FormData();
                
                // append the image
                const localUri = result.assets[0].uri;
                const filename = localUri.split('/').pop();
                const match = filename ? /\.(\w+)$/.exec(filename) : null;
                const type = match ? `image/${match[1]}` : 'image';
                
                formData.append('image', {
                    uri: localUri,
                    name: filename,
                    type
                } as any);
                
                // append the auth token
                formData.append('token', authState?.token || '');
                
                const response = await axios.post(
                    `${API_URL}/profile-image`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                
                if (response.data.status === 'ok') {
                    setProfileImage({ uri: response.data.data.profileImage });
                    getData();
                    setNotification({
                        visible: true,
                        type: 'success',
                        message: 'Profile picture updated!'
                    });
                } else {
                    console.error('Upload failed:', response.data);
                    setNotification({
                        visible: true,
                        type: 'error',
                        message: 'Failed to upload image. Please try again.'
                    });
                }
            }
        } catch (error) {
            console.error('Error selecting photo:', error);
            setNotification({
                visible: true,
                type: 'error',
                message: 'Error selecting photo. Please try again.'
            });
        } finally {
            setUploadLoading(false);
            setPfpModalVisible(false);
        }
    };
    
    const handleRemoveImage = async () => {
        try {
            const response = await axios.post(`${API_URL}/remove-profile-image`, {
                token: authState?.token
            });
    
            if (response.data.status === 'ok') {
                getData(); 
                setNotification({
                    visible: true,
                    type: 'success',
                    message: 'Profile picture removed successfully'
                });
            } else {
                setNotification({
                    visible: true,
                    type: 'error',
                    message: 'Failed to remove profile picture'
                });
            }
        } catch (error) {
            console.error('Remove image error:', error);
            setNotification({
                visible: true,
                type: 'error',
                message: 'Error removing profile picture'
            });
        } finally {
            setPfpModalVisible(false);
        }
    };
    
    const closeNotification = () => {
        setNotification({...notification, visible: false});
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.contentContainer}>
                {/* middle background colour */}
                <View 
                    style={[
                        styles.middleBackground, 
                        { backgroundColor: middleBgColor, zIndex: -2 }]} 
                />

                {/* header with image and basic info */}
                <ProfileHeader 
                    name={userData.name}
                    program={userData.program}
                    profileImage={profileImage}
                    onEditPress={() => setEditModalVisible(true)}
                />

                {/* pinboard about me */}
                <Pinboard 
                    aboutMe={userData.aboutMe}
                    widgets={userData.widgets}
                />

                {/* posts scroller */}
                <PostsContainer />
            </View>

            <ImagePickerModal 
                modalVisible={pfpModalVisible}
                onClose={() => setPfpModalVisible(false)}
                onCameraPress={handleCameraUpload}
                onGalleryPress={handleGalleryUpload}
                onRemovePress={handleRemoveImage}
                isLoading={uploadLoading}
                hasExistingImage={!!profileImage.uri}
                title="Update Profile Picture"
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

            {/* notification popup */}
            <Popup
                visible={notification.visible}
                type={notification.type}
                message={notification.message}
                onClose={closeNotification}
                autoClose={true}
                duration={3000}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    middleBackground: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        height: 370,
    },
    contentContainer: {
        alignItems: 'center',
        position: 'relative',
    }
})



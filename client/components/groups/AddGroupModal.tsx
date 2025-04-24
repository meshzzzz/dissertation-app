import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, TextInput, StyleSheet, View as DefaultView, ActivityIndicator, Image, AppState } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from '../images/ImagePickerModal';

interface AddGroupModalProps {
    modalVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
    modalVisible,
    onClose,
    onSuccess
}) => {
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const { authState } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateGroup = async () => {
        if (!name.trim()) {
            setError('Group name cannot be empty');
            return;
        }
    
        setIsLoading(true);
        setError('');
    
        try {
            // create the group (no image yet)
            const response = await axios.post(`${API_URL}/groups`, {
                name,
                description,
                token: authState?.token
            });
            
            if (response.data?.status !== 'ok') {
                throw new Error(response.data?.message || 'Failed to create group');
            }
            
            const newGroupId = response.data.data.id;
            
            // if an image has been provided, upload it using the new group ID
            if (imageUri) {
                const formData = new FormData();
                
                // append the image
                const filename = imageUri.split('/').pop();
                const match = filename ? /\.(\w+)$/.exec(filename) : null;
                const type = match ? `image/${match[1]}` : 'image';
                
                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type
                } as any);
                
                // append the auth token
                formData.append('token', authState?.token || '');
                
                await axios.post(
                    `${API_URL}/groups/${newGroupId}/image`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${authState?.token}`
                        },
                    }
                );
            }
            
            onSuccess();
            onClose();
            setName('');
            setDescription('');
            setImageUri(null);
        } catch (err) {
            setError('Could not add group. Please try again.');
            console.error('Add group error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // choosing group image from gallery
    const handleChooseFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Gallery permission is required');
                return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.7,
            });
            
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting photo:', error);
            setError('Error selecting photo. Please try again.');
        } finally {
            setShowImageOptions(false);
        }
    };
    
    // remove selected group image
    const handleRemoveImage = () => {
        setImageUri(null);
        setShowImageOptions(false);
    };

    return (
        <Modal animationType="fade" visible={modalVisible} transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View 
                    style={styles.modal}
                    lightColor="#FFFFFF"
                    darkColor="#1F2937"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Group</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Group Name</Text>
                        <TextInput
                            style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter group name"
                            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { color: colorScheme === 'dark' ? '#fff' : '#000' }
                            ]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter description"
                            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Group Image</Text>
                        
                        {imageUri ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image 
                                    source={{ uri: imageUri }} 
                                    style={styles.imagePreview} 
                                    resizeMode="cover"
                                />
                                <TouchableOpacity 
                                    style={styles.changeImageButton}
                                    onPress={() => setShowImageOptions(true)}
                                >
                                    <Text style={styles.changeImageText}>Change Image</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={() => setShowImageOptions(true)}
                            >
                                <Ionicons name="image-outline" size={24} color={accentColor} />
                                <Text style={[styles.addImageText, { color: accentColor }]}>
                                    Add Group Image
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: accentColor }]}
                            onPress={handleCreateGroup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <ImagePickerModal
                modalVisible={showImageOptions}
                onClose={() => setShowImageOptions(false)}
                onGalleryPress={handleChooseFromGallery}
                onRemovePress={handleRemoveImage}
                hasExistingImage={!!imageUri}
                title="Add a Group Image"
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modal: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    },
    imagePreviewContainer: {
        marginBottom: 10,
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    changeImageButton: {
        alignSelf: 'flex-end',
    },
    changeImageText: {
        color: '#4285F4',
        fontWeight: '500',
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
        justifyContent: 'center',
    },
    addImageText: {
        marginLeft: 8,
        fontWeight: '500',
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelText: {
        fontWeight: '500',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default AddGroupModal;
import React, { useState } from 'react';
import { 
    Modal, 
    TouchableOpacity, 
    TextInput, 
    StyleSheet, 
    ActivityIndicator, 
    Image, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableWithoutFeedback, 
    Keyboard,
    Alert
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from '../images/ImagePickerModal';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useEvents } from '@/context/EventContext';

interface AddEventModalProps {
    modalVisible: boolean;
    onClose: () => void;
    groupId: string;
}

const AddEventModal = ({ modalVisible, onClose, groupId }: AddEventModalProps) => {
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const { authState } = useAuth();
    const { fetchUserEvents, fetchGroupEvents } = useEvents();
    
    // form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    // ui state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateEvent = async () => {
        if (!title.trim()) {
            setError('Event title cannot be empty');
            return;
        }
    
        setIsLoading(true);
        setError('');
    
        try {
            // create event (not the image)
            const response = await axios.post(`${API_URL}/groups/${groupId}/events`, {
                title,
                description,
                date: date.toISOString(),
                token: authState?.token
            });
            
            if (response.data?.status !== 'ok') {
                throw new Error(response.data?.message || 'Failed to create event');
            }
            
            const newEventId = response.data.data.id;
            
            // if image added, upload with eventid
            if (imageUri) {
                const formData = new FormData();
                
                // Append the image
                const filename = imageUri.split('/').pop();
                const match = filename ? /\.(\w+)$/.exec(filename) : null;
                const type = match ? `image/${match[1]}` : 'image';
                
                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type
                } as any);
                
                // Append the auth token
                formData.append('token', authState?.token || '');
                
                await axios.post(
                    `${API_URL}/events/${newEventId}/image`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${authState?.token}`
                        },
                    }
                );
            }
            // refresh both group events and feed events to update UI
            fetchGroupEvents(groupId);
            fetchUserEvents();
    
            resetForm();
            onClose();

            Alert.alert(
                "Success",
                "Event created successfully!"
            );
        } catch (err) {
            setError('Could not add event. Please try again.');
            console.error('Add event error:', err);
            Alert.alert(
                "Error",
                "Failed to create event. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate(new Date());
        setImageUri(null);
    };

    // format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // format time for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
      };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const showTimePicker = () => {
        setTimePickerVisibility(true);
      };
    
    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    // update date to reflect new day without affecting the time
    const handleConfirmDate = (selectedDate: Date) => {
        const newDate = new Date(selectedDate);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);

        setDate(newDate);
        hideDatePicker();
    };

    // update date to reflect new time without affecting the day
    const handleConfirmTime = (selectedTime: Date) => {
        const newDate = new Date(date);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());

        setDate(newDate);
        hideTimePicker();
    };

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
            Alert.alert("Error", "Failed to select image. Please try again.");
        } finally {
            setShowImageOptions(false);
        }
    };
    
    const handleRemoveImage = () => {
        setImageUri(null);
        setShowImageOptions(false);
    };

    return (
        <Modal animationType="fade" visible={modalVisible} transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <View 
                            style={styles.modal}
                            lightColor="#FFFFFF"
                            darkColor="#1F2937"
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>Add New Event</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Event Title</Text>
                                <TextInput
                                    style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Enter event title"
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
                                <Text style={styles.label}>Date & Time</Text>
                                <View style={styles.dateTimeContainer}>
                                    <TouchableOpacity 
                                        style={styles.dateButton} 
                                        onPress={showDatePicker}
                                    >
                                    <Ionicons name="calendar-outline" size={20} color={accentColor} />
                                        <Text style={[styles.dateTimeText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                                            {formatDate(date)}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.timeButton} 
                                        onPress={showTimePicker}
                                    >
                                        <Ionicons name="time-outline" size={20} color={accentColor} />
                                        <Text style={[styles.dateTimeText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                                            {formatTime(date)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>


                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Event Image</Text>
                                
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
                                            Add Event Image
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
                                    onPress={handleCreateEvent}
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
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
            <ImagePickerModal
                modalVisible={showImageOptions}
                onClose={() => setShowImageOptions(false)}
                onGalleryPress={handleChooseFromGallery}
                onRemovePress={handleRemoveImage}
                hasExistingImage={!!imageUri}
                title="Add an Event Image"
            />
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                date={date}
            />
            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
                date={date}
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
    keyboardView: {
        width: '100%',
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
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
    },
    timeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginLeft: 8,
    },
    dateTimeText: {
        fontSize: 16,
        marginLeft: 8,
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

export default AddEventModal;
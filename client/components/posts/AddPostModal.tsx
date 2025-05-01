import React, { useState } from 'react';
import { 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuth, API_URL } from '@/context/AuthContext';
import axios from 'axios';
import { Post } from '@/types/Post';
import { usePosts } from '@/context/PostContext';

interface AddPostModalProps {
    visible: boolean;
    onClose: () => void;
    onPostCreated: (newPost: Post) => void;
    groupId: string;
}

const AddPostModal = ({ visible, onClose, onPostCreated, groupId }: AddPostModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    const { fetchFeedPosts, fetchGroupPosts, fetchMyPosts } = usePosts();

    const handleSubmit = async () => {
        // validate input
        if (!content.trim()) {
            setError('Post content is required');
            return;
        }

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/posts`, {
                token: authState?.token,
                title: title.trim(),
                content: content.trim(),
                groupId
            });

            if (response.data.status === 'ok') {
                // pass new post back to parent component
                onPostCreated(response.data.data);

                // refresh posts in context
                fetchGroupPosts(groupId);
                fetchFeedPosts();
                fetchMyPosts();
                
                // reset form and close modal
                setTitle('');
                setContent('');
                onClose();
            } else {
                setError(response.data.data || 'Failed to create post');
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Network error when creating post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
    <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
    >
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
                            <Text style={styles.title}>Create Post</Text>
                            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                                <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Title (Optional)</Text>
                            <TextInput
                                style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Add a title"
                                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                                maxLength={100}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Content</Text>
                            <TextInput
                                style={[
                                styles.input,
                                styles.textArea,
                                { color: colorScheme === 'dark' ? '#fff' : '#000' }
                                ]}
                                value={content}
                                onChangeText={setContent}
                                placeholder="What's on your mind?"
                                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={2000}
                            />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: accentColor }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                            ) : (
                            <Text style={styles.buttonText}>Post</Text>
                            )}
                        </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
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
        minHeight: 150,
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

export default AddPostModal;
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { 
    View, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    replyingTo?: string;
    onCancelReply?: () => void;
}

const CommentInput = forwardRef<TextInput, CommentInputProps>(({ 
    onSubmit, 
    placeholder = 'Add a comment...', 
    replyingTo,
    onCancelReply
}, ref) => {
    const colorScheme = useColorScheme();
    const primaryColor = Colors[colorScheme ?? 'light'].primary;
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // forward the ref to allow input focus in post screen
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleSubmit = async () => {
        if (!comment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(comment.trim());
            setComment('');
            Keyboard.dismiss();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelReply = () => {
        if (onCancelReply) {
            onCancelReply();
            setComment('');
        }
    };

    // focus the input when reply mode is activated
    useEffect(() => {
        if (replyingTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyingTo]);

    return (
        <View style={styles.container}>
            {/* reply indicator */}
            {replyingTo && (
                <View style={styles.replyingContainer}>
                    <Text style={styles.replyingText}>
                        Replying to <Text style={styles.replyingName}>{replyingTo}</Text>
                    </Text>
                    <TouchableOpacity onPress={handleCancelReply} style={styles.cancelButton}>
                        <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            )}
            
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={comment}
                    onChangeText={setComment}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: comment.trim() ? primaryColor : '#ccc' }
                    ]}
                    onPress={handleSubmit}
                    disabled={!comment.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
        );
    });

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 8,
    },
    replyingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    replyingText: {
        fontSize: 13,
        color: '#666',
    },
    replyingName: {
        fontWeight: '600',
    },
    cancelButton: {
        padding: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
    },
    submitButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});

export default CommentInput;
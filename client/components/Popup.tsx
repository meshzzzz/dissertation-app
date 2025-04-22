import React, { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface PopupProps {
    visible: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

const Popup: React.FC<PopupProps> = ({
    visible,
    type,
    message,
    onClose,
    autoClose = true,
    duration = 3000
}) => {
    const colorScheme = useColorScheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            
            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        }
    }, [visible]);
    
    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };
    
    if (!visible) return null;
    
    const iconName = type === 'success' ? 'checkmark-circle' : 'alert-circle';
    const iconColor = type === 'success' ? 
        (colorScheme === 'dark' ? '#4ADE80' : '#22C55E') : 
        (colorScheme === 'dark' ? '#F87171' : '#EF4444');
    
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={handleClose}
        >
            <Animated.View 
                style={[
                    styles.container,
                    { opacity: fadeAnim }
                ]}
            >
                <View
                    style={styles.popup}
                    lightColor="#FFFFFF"
                    darkColor="#1F2937"
                >
                    <Ionicons name={iconName} size={24} color={iconColor} style={styles.icon} />
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popup: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 16,
    },
    closeButton: {
        padding: 4,
    }
});

export default Popup;
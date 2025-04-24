import { Text, View } from '../Themed';
import { Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface ImagePickerModalProps {
    modalVisible: boolean;
    onClose: () => void;
    onCameraPress?: () => void;
    onGalleryPress: () => void;
    onRemovePress: () => void;
    isLoading?: boolean;
    hasExistingImage?: boolean;
    title?: string;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
    modalVisible,
    onClose,
    onCameraPress,
    onGalleryPress,
    onRemovePress,
    isLoading = false,
    hasExistingImage = false,
    title = "Select Image"
}) => {
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    
    return (
        <Modal 
            animationType="fade" 
            visible={modalVisible} 
            transparent
            onRequestClose={onClose}
        >
            <View 
                style={styles.overlay}
                lightColor={Colors.overlay}
                darkColor={Colors.overlay}
            >
                <View 
                    style={styles.container}
                    lightColor="#FFFFFF"
                    darkColor="#1F2937"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    
                    {isLoading ? (
                        <ActivityIndicator size="large" color={accentColor} style={styles.loader} />
                    ) : (
                        <View>
                            { onCameraPress && (
                                <TouchableOpacity 
                                    style={styles.option}
                                    onPress={onCameraPress}
                                >
                                    <Ionicons style={styles.optionIcon} name="camera" size={24} color={accentColor} />
                                    <Text style={styles.optionText}>Take a photo</Text>
                                </TouchableOpacity>
                            )}
                        
                            <TouchableOpacity 
                                style={styles.option}
                                onPress={onGalleryPress}
                            >
                                <Ionicons style={styles.optionIcon} name="images" size={24} color={accentColor} />
                                <Text style={styles.optionText}>Choose from gallery</Text>
                            </TouchableOpacity>
                            
                            {hasExistingImage && onRemovePress && (
                                <TouchableOpacity 
                                    style={[styles.option, styles.removeOption]}
                                    onPress={onRemovePress}
                                >
                                    <Ionicons style={styles.optionIcon} name="trash" size={24} color="red" />
                                    <Text style={styles.optionText}>Remove image</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    loader: {
        marginVertical: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    optionIcon: {
        marginRight: 16,
    },
    optionText: {
        fontSize: 16,
    },
    removeOption: {
        backgroundColor: 'rgba(255,0,0,0.1)',
    }
});

export default ImagePickerModal;
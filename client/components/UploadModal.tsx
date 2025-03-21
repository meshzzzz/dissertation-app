import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface UploadModalProps {
    modalVisible: boolean;
    onBackPress: () => void;
    onCameraPress: () => void;
    onGalleryPress: () => void;
    onRemovePress: () => void;
    isLoading?: boolean;
    hasExistingImage?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
    modalVisible,
    onBackPress,
    onCameraPress,
    onGalleryPress,
    onRemovePress,
    isLoading = false,
    hasExistingImage = false,
}) => {
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    
    return (
        <Modal 
            animationType="fade" 
            visible={modalVisible} 
            transparent={true}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-5">
                <View className="w-full bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold dark:text-white">Update Profile Picture</Text>
                        <TouchableOpacity onPress={onBackPress} className="p-1">
                            <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    
                    {isLoading ? (
                        <ActivityIndicator size="large" color={accentColor} className="py-5" />
                    ) : (
                        <View className="space-y-3">
                            <TouchableOpacity 
                                className="flex-row items-center bg-gray-50 p-4 rounded-lg"
                                onPress={onCameraPress}
                            >
                                <Ionicons name="camera" size={28} color={accentColor} />
                                <Text className="ml-4 text-base dark:text-white">Take a photo</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                className="flex-row items-center p-4 bg-gray-50 rounded-lg"
                                onPress={onGalleryPress}
                            >
                                <Ionicons name="images" size={28} color={accentColor} />
                                <Text className="ml-4 text-base dark:text-white">Choose from gallery</Text>
                            </TouchableOpacity>
                            
                            {hasExistingImage && (
                                <TouchableOpacity 
                                    className="flex-row items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    onPress={onRemovePress}
                                >
                                    <Ionicons name="trash" size={28} color="#FF3B30" />
                                    <Text className="ml-4 text-base dark:text-white">Remove photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default UploadModal;
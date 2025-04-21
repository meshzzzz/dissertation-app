import { Text, View } from '../Themed';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
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
            <View 
                className="flex-1 justify-center items-center p-5"
                lightColor={Colors.overlay}
                darkColor={Colors.overlay}
            >
                <View 
                    className="w-full rounded-xl p-5 shadow-md"
                    style={{ backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' }}
                >
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold">Update Profile Picture</Text>
                        <TouchableOpacity onPress={onBackPress} className="p-1">
                            <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    
                    {isLoading ? (
                        <ActivityIndicator size="large" color={accentColor} className="py-5" />
                    ) : (
                        <View>
                            <TouchableOpacity 
                                className="flex-row items-center p-4 mb-4"
                                style={{ 
                                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB',
                                    borderRadius: 8
                                }}
                                onPress={onCameraPress}
                            >
                                <Ionicons className="mr-4" name="camera" size={30} color={accentColor} />
                                <Text className="text-base">Take a photo</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                className="flex-row items-center p-4 mb-4"
                                style={{ 
                                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB',
                                    borderRadius: 8 
                                }}
                                onPress={onGalleryPress}
                            >
                                <Ionicons className="mr-4" name="images" size={28} color={accentColor} />
                                <Text className="ml-1">Choose from gallery</Text>
                            </TouchableOpacity>
                            
                            {hasExistingImage && (
                                <TouchableOpacity 
                                    className="flex-row items-center p-4"
                                    style={{ 
                                        backgroundColor: colorScheme === 'dark' ? '#513737' : '#f7eceb',
                                        borderRadius: 8 
                                    }}
                                    onPress={onRemovePress}
                                >
                                    <Ionicons className="mr-4" name="trash" size={28} color={colorScheme === 'dark' ? Colors.dark.error : Colors.light.error} />
                                    <Text className="ml-1">Remove photo</Text>
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
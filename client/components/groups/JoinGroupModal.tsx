import React, { useState } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Group } from '@/types/Group';

interface JoinGroupModalProps {
    isVisible: boolean;
    onClose: () => void;
    onJoin: () => void;
    group: Group;
    isLoading: boolean;
}

const JoinGroupModal = ({
    isVisible,
    onClose,
    onJoin,
    group,
    isLoading
}: JoinGroupModalProps) => {
    const colorScheme = useColorScheme();
    const secondaryColor = Colors[colorScheme ?? 'light'].secondary;

    const handleBackdropPress = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {/* header with close button */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Join Group</Text>
                                {!isLoading && (
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            {/* group icon */}
                            <Image
                                source={{ uri: group.groupImage }}
                                style={styles.groupIcon}
                                resizeMode="cover"
                            />
                            
                            {/* group info */}
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.membersCount}>{group.membersCount} members</Text>
                            <Text style={styles.groupDescription}>{group.description}</Text>
                            {/* join button */}
                            <TouchableOpacity 
                                style={[styles.joinButton, { backgroundColor: secondaryColor }]}
                                onPress={onJoin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.joinButtonText}>Join Group</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
    },
    groupIcon: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginBottom: 16,
    },
    groupName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    membersCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    groupDescription: {
        fontSize: 14,
        color: 'black',
        opacity: 0.9,
        marginBottom: 24,
    },
    joinButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    joinButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default JoinGroupModal;
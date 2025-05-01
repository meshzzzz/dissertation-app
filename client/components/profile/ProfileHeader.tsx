import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
    name: string;
    program: string;
    profileImage: { uri: string };
    onEditPress: () => void;
}

const ProfileHeader = ({
    name,
    program,
    profileImage,
    onEditPress
}: ProfileHeaderProps) => {
    const colorScheme = useColorScheme();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;

    return (
        <>
            <TouchableOpacity 
                style={styles.editButton}
                onPress={onEditPress}
            >
                <Ionicons name="pencil" size={24} color={'#578BBB'} />
            </TouchableOpacity>

            {/* profile picture */}
            <View style={styles.profilePictureContainer}>
            <View style={[
                styles.profilePictureFrame,
                { 
                    borderWidth: 6, 
                    borderColor: accentColor,
                    backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3 
                }
            ]}>
                <Image
                    source={profileImage}
                    style={styles.profilePicture}
                />
            </View>
            </View>

            {/* user info */}
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userProgram}>{program}</Text>
        </>
    );
};

const styles = StyleSheet.create({
    editButton: {
        position: 'absolute',
        top: 120,
        right: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    profilePictureContainer: {
        marginTop: 15,
        marginBottom: 16,
    },
    profilePictureFrame: {
        width: 190,
        height: 190,
        borderRadius: 100,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture: {
        width: 178,
        height: 178,
        borderRadius: 100,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userProgram: {
        fontSize: 15,
        marginBottom: 20,
    },
});

export default ProfileHeader;
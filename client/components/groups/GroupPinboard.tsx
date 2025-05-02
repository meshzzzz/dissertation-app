import React from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface GroupPinboardProps {
    name: string;
    memberCount: number;
    description: string;
    groupImage: string;
}

const GroupPinboard = ({ name, memberCount, description, groupImage }: GroupPinboardProps) => {
    const colorScheme = useColorScheme();
    const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;

    return (
        <View style={[
            styles.pinboard,
            { backgroundColor: pinboardColor }
        ]}>
            {/* pinboard corner dots */}
            <View style={[styles.cornerDot, styles.topLeftDot]} />
            <View style={[styles.cornerDot, styles.topRightDot]} />
            <View style={[styles.cornerDot, styles.bottomLeftDot]} />
            <View style={[styles.cornerDot,styles.bottomRightDot]} />
            
            <View style={styles.pinboardContent}>
                <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                        <Text style={[
                            styles.pinboardTitle,
                            { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}
                        >
                            {name}
                        </Text>
                    </View>
                    {/* polaroid group pic */}
                    <View style={styles.polaroidContainer}>
                        <View style={styles.polaroidFrame}>
                            <Image 
                                source={{ uri: groupImage }} 
                                style={styles.polaroidImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.polaroidCaption}>
                                {memberCount} members
                            </Text>
                        </View>
                    </View>
                </View>
                {/* description postit */}
                <ImageBackground 
                    source={require('@/assets/images/pink_postit.png')} 
                    style={styles.postitContainer}
                >
                    <Text style={styles.descriptionText}>
                        {description}
                    </Text>
                </ImageBackground>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pinboard: {
        position: 'relative',
        borderRadius: 15,
        padding: 15,
        marginTop: 10,
        marginBottom: 18,
        width: '90%',
        minHeight: 450,
        alignSelf: 'center',
    },
    cornerDot: {
        position: 'absolute',
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#C19259'
    },
    topLeftDot: {
        top: 15,
        left: 15,
    },
    topRightDot: {
        top: 15,
        right: 15,
    },
    bottomLeftDot: {
        bottom: 15,
        left: 15,
    },
    bottomRightDot: {
        bottom: 15,
        right: 15,
    },
    pinboardContent: {
        marginHorizontal: 20,
        marginVertical: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleContainer: {
        flex: 1,
        marginRight: 10,
    },
    pinboardTitle: {
        fontFamily: 'LondrinaShadow',
        fontSize: 40,
        marginBottom: 6,
        marginTop: 4,
    },
    polaroidContainer: {
        marginTop: 10,
    },
    polaroidFrame: {
        backgroundColor: 'white',
        padding: 5,
        borderWidth: 1,
        borderColor: 'black',
    },
    polaroidImage: {
        width: 100,
        height: 80,
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 3
    },
    polaroidCaption: {
        fontFamily: 'Itim',
        fontSize: 11,
        textAlign: 'center',
        color: 'black',
    },
    postitContainer: {
        width: '80%',
        minHeight: 150,
        padding: 20,
        marginLeft: -20,
        marginTop: -50
    },
    descriptionText: {
        fontFamily: 'Itim',
        fontSize: 11,
        lineHeight: 14,
        color: 'black',
        width: 104,
        height: 88,
        marginLeft: 20,
        marginTop: 15
    }
});

export default GroupPinboard;
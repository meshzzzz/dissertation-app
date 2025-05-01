import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { COUNTRIES } from '@/constants/CountryData';

interface PinboardProps {
    aboutMe: string;
    widgets: {
        country: string;
        campus: string;
        accomodation: string;
    };
}

const Pinboard = ({ aboutMe, widgets }: PinboardProps) => {
    const colorScheme = useColorScheme();
    const pinboardColor = Colors[colorScheme ?? 'light'].profile.pinboard;

    const getCountryEmoji = (countryName: string) => {
        const country = COUNTRIES.find(c => c.value === countryName);
        return country?.emoji || '🌎'; // default world emoji
    };

    const hasAnyWidgets = 
        widgets.country && widgets.country !== 'Not Set' ||
        widgets.campus && widgets.campus !== 'Not Set' ||
        widgets.accomodation && widgets.accomodation !== 'Not Set';

    return (
        <View style={[
            styles.pinboard,
            { backgroundColor: pinboardColor }
        ]}>
            {/* pinboard corner dots */}
            <View style={[
                styles.cornerDot,
                styles.topLeftDot,
            ]} />
            
            <View style={[
                styles.cornerDot,
                styles.topRightDot,
            ]} />
            
            <View style={[
                styles.cornerDot,
                styles.bottomLeftDot,
            ]} />
            
            <View style={[
                styles.cornerDot,
                styles.bottomRightDot,
            ]} />
            
            <View style={styles.pinboardContent}>
                <Text style={[
                    styles.pinboardTitle,
                    { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}>
                    About me
                </Text>
                <Text style={[
                    styles.pinboardText,
                    { color: colorScheme === 'dark' ? '#EEE' : '#000' }]}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {aboutMe || "Nice to meet you!"}
                </Text>

                {/* location info */}
                <View style={styles.locationContainer}>
                    {widgets.country && widgets.country !== 'Not Set' && (
                        <View style={styles.locationItem}>
                            <Text style={styles.countryEmoji}>{getCountryEmoji(widgets.country)}</Text>
                            <Text style={styles.locationText}>{widgets.country}</Text>
                        </View>
                    )}
                    
                    {widgets.campus && widgets.campus !== 'Not Set' && (
                        <View style={styles.locationItem}>
                            <FontAwesome name="university" size={12} color="#16529C" />
                            <Text style={styles.locationText}>{widgets.campus}</Text>
                        </View>
                    )}
                    
                    {widgets.accomodation && widgets.accomodation !== 'Not Set' && (
                        <View style={styles.locationItem}>
                            <MaterialIcons name="apartment" size={15} color="#16529C" />
                            <Text style={styles.locationText}>{widgets.accomodation}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pinboard: {
        position: 'relative',
        borderRadius: 15,
        padding: 18,
        marginBottom: 18,
        width: '90%',
        minHeight: 150,
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
    pinboardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 4,
    },
    pinboardText: {
        fontSize: 12,
        marginBottom: 10,
        lineHeight: 22,
        height: 44,
        overflow: 'hidden',
    },
    countryEmoji: {
        fontSize: 14,
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flex: 1,
    },
    locationText: {
        marginLeft: 8,
        fontSize: 10,
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: '70%',
    },
});

export default Pinboard;
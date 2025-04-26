import React from 'react';
import { StyleSheet, Image, View as RNView, ImageBackground } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface GroupPinboardProps {
  name: string;
  description: string;
  image: string;
  memberCount: number;
  nextEvent?: {
    title: string;
    date: string;
    time: string;
    daysToGo: number;
    image?: string;
  };
  admins?: Array<{
    name: string;
    image: string;
  }>;
}

export default function GroupPinboard({ 
  name, 
  description, 
  image, 
  memberCount,
  nextEvent,
  admins = [
    { name: 'Robbie', image: 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745001234/default_profile_luwenw.png' },
    { name: 'Clara', image: 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745001234/default_profile_luwenw.png' }
  ]
}: GroupPinboardProps) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      {/* Center title */}
      <RNView style={styles.titleContainer}>
        <Text style={styles.title}>{name}</Text>
      </RNView>
      
      {/* Pinboard Container */}
      <RNView style={styles.pinboardContainer}>
        {/* Pins at corners */}
        <RNView style={[styles.pin, styles.pinTopLeft]}>
          <RNView style={styles.pinHead} />
        </RNView>
        <RNView style={[styles.pin, styles.pinTopRight]}>
          <RNView style={styles.pinHead} />
        </RNView>
        <RNView style={[styles.pin, styles.pinBottomLeft]}>
          <RNView style={styles.pinHead} />
        </RNView>
        <RNView style={[styles.pin, styles.pinBottomRight]}>
          <RNView style={styles.pinHead} />
        </RNView>
        
        {/* Group Title */}
        <RNView style={styles.groupHeaderContainer}>
          <Text style={styles.groupHeader}>Walking</Text>
          <Text style={styles.groupSubheader}>Group</Text>
          
          {/* Group decorative items */}
          <RNView style={styles.decorPushpin}>
            <Ionicons name="pin" size={24} color="#00BCD4" />
          </RNView>
        </RNView>
        
        {/* Group Image */}
        <RNView style={styles.groupImageContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.groupImage}
            resizeMode="cover"
          />
          <RNView style={styles.memberCountContainer}>
            <Text style={styles.memberCountText}>{memberCount} Members</Text>
          </RNView>
        </RNView>
        
        {/* Description Note */}
        <RNView style={styles.descriptionContainer}>
          <Ionicons name="happy" size={24} color="#FFC107" style={styles.descriptEmoji} />
          <Text style={styles.descriptionTitle}>Welcome to the QLink Walking Group!</Text>
          <Text style={styles.descriptionText}>
            {description || 'Get involved with our walking meetups & find great routes to take on your own.'}
          </Text>
        </RNView>
        
        {/* Next Event Note */}
        {nextEvent && (
          <RNView style={styles.nextEventContainer}>
            <Text style={styles.nextEventTitle}>Next Event</Text>
            <Image 
              source={{ uri: nextEvent.image || 'https://res.cloudinary.com/dtey1y2fw/image/upload/v1745500388/london_xefgsh.jpg' }}
              style={styles.nextEventImage}
            />
            <Text style={styles.nextEventName}>{nextEvent.title}</Text>
            <Text style={styles.nextEventDate}>{nextEvent.date} • {nextEvent.time}</Text>
            <RNView style={styles.daysToGoContainer}>
              <Text style={styles.daysToGoText}>{nextEvent.daysToGo}</Text>
              <Text style={styles.daysToGoLabel}>days to go</Text>
            </RNView>
          </RNView>
        )}
        
        {/* Admins Note */}
        <RNView style={styles.adminsContainer}>
          <Text style={styles.adminsTitle}>Admins</Text>
          {admins.map((admin, index) => (
            <RNView key={index} style={styles.adminRow}>
              <Image source={{ uri: admin.image }} style={styles.adminImage} />
              <Text style={styles.adminName}>{admin.name}</Text>
              <Text style={styles.adminArrow}>&gt;</Text>
            </RNView>
          ))}
        </RNView>
        
        {/* Online indicator */}
        <RNView style={styles.onlineContainer}>
          <RNView style={styles.onlineDot} />
          <Text style={styles.onlineText}>32 online</Text>
        </RNView>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pinboardContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    backgroundColor: '#F5D6A8', // Cork board color
    padding: 16,
    minHeight: 400,
    position: 'relative',
    overflow: 'visible',
  },
  pin: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#2C387E',
    borderRadius: 5,
    zIndex: 10,
  },
  pinHead: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    top: -3,
    left: -3,
  },
  pinTopLeft: {
    top: 0,
    left: 0,
  },
  pinTopRight: {
    top: 0,
    right: 0,
  },
  pinBottomLeft: {
    bottom: 0,
    left: 0,
  },
  pinBottomRight: {
    bottom: 0,
    right: 0,
  },
  groupHeaderContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'transparent',
  },
  groupHeader: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'System',
  },
  groupSubheader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginTop: -10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: 'System',
  },
  decorPushpin: {
    position: 'absolute',
    top: -10,
    right: -20,
    backgroundColor: 'transparent',
    transform: [{ rotate: '25deg' }],
  },
  groupImageContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: 130,
    height: 130,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'white',
    transform: [{ rotate: '2deg' }],
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  memberCountContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
  },
  memberCountText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    position: 'absolute',
    top: 110,
    left: 20,
    width: '55%',
    backgroundColor: '#FFAFC8', // Pink sticky note
    padding: 15,
    borderRadius: 5,
    transform: [{ rotate: '-1deg' }],
  },
  descriptEmoji: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: 'transparent',
  },
  descriptionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 13,
  },
  descriptionText: {
    fontSize: 12,
  },
  nextEventContainer: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 160,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    transform: [{ rotate: '1deg' }],
  },
  nextEventTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    textDecorationLine: 'underline',
  },
  nextEventImage: {
    width: 150,
    height: 90,
    alignSelf: 'center',
    marginVertical: 3,
  },
  nextEventName: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  nextEventDate: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  daysToGoContainer: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  daysToGoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  daysToGoLabel: {
    fontSize: 8,
  },
  adminsContainer: {
    position: 'absolute',
    left: 20,
    bottom: 70,
    width: 140,
    backgroundColor: '#FAFF72', // Yellow sticky note
    padding: 10,
    borderRadius: 5,
    transform: [{ rotate: '-3deg' }],
  },
  adminsTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    backgroundColor: 'transparent',
  },
  adminImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  adminName: {
    flex: 1,
    fontSize: 12,
  },
  adminArrow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  onlineContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    color: '#4CAF50',
  },
});
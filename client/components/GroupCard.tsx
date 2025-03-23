import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

interface GroupCardProps {
  id: string;
  name: string;
  membersCount: number;
  backgroundColor: string;
  onPress: (id: string) => void;
}

const { width } = Dimensions.get('window');
// calculate card width to ensure proper dimensions even with percentage classes
const cardWidth = Math.floor((width - 40) / 2);

const GroupCard = ({ 
  id, 
  name, 
  membersCount, 
  backgroundColor, 
  onPress 
}: GroupCardProps) => {
  return (
    <TouchableOpacity
      className="overflow-hidden rounded-lg mb-4 relative"
      style={{ 
        width: cardWidth, 
        height: cardWidth,
        backgroundColor 
      }}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      {/* overlay for better text visibility */}
      <View className="absolute inset-0 bg-black/20" />
      
      <View className="absolute bottom-0 left-0 right-0 p-2">
        <Text className="text-white text-lg font-bold">{name}</Text>
        <Text className="text-white text-xs">{membersCount} members</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GroupCard;
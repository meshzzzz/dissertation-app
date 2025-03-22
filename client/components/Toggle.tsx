import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface ToggleProps {
  isActive: boolean;
  onToggle: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({
  isActive,
  onToggle,
  leftIcon,
  rightIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.toggle,
        { backgroundColor: isActive ? '#2a2e37' : '#f0f0f0' }
      ]}
      activeOpacity={0.8}
    >
      <View style={[styles.leftIcon, { opacity: !isActive ? 1 : 0.4 }]}>
        {leftIcon}
      </View>
      
      <View style={[styles.rightIcon, { opacity: isActive ? 1 : 0.4 }]}>
        {rightIcon}
      </View>
      
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: isActive ? '#1a1d24' : '#ffffff',
            left: isActive ? undefined : 4,
            right: isActive ? 4 : undefined,
          }
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    position: 'relative',
    width: 64,
    height: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  leftIcon: {
    position: 'absolute',
    left: 6
  },
  rightIcon: {
    position: 'absolute',
    right: 6
  },
  thumb: {
    position: 'absolute',
    height: 24,
    width: 24,
    borderRadius: 12
  }
});

export default Toggle;
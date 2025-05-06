import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoundedButtonProps {
    label: string;
    onPress: () => void;
    color: string;
    iconName?: string; 
    marginRight?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
}

const RoundedButton = ({ 
    label, 
    onPress, 
    color,
    iconName,
    marginRight = false,
    disabled = false,
    fullWidth = false
}: RoundedButtonProps) => {
    const getLighterShade = (hexColor: string, opacity: number = 0.15): string => {
        // if colour already in rgba format, just adjust the opacity
        if (hexColor.startsWith('rgba')) {
            return hexColor.replace(/[\d\.]+\)$/g, `${opacity})`);
        }
        
        // if colour in hex format, convert to rgba
        let hex = hexColor.replace('#', '');
        
        // handle shorthand hex
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    
    const backgroundColor = getLighterShade(color);
    
    return (
        <TouchableOpacity
            style={[
                styles.button,
                marginRight && styles.marginRight,
                fullWidth && styles.fullWidth,
                { 
                    backgroundColor,
                    borderColor: color,
                    opacity: disabled ? 0.6 : 1
                }
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            {iconName && (
                <View style={styles.iconContainer}>
                    <Ionicons 
                        name={iconName as any} 
                        size={20} 
                        color={color} 
                    />
                </View>
            )}
            <View style={styles.labelContainer}>
                <Text style={[styles.label, { color }]}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 16, 
        paddingHorizontal: 12, 
        paddingVertical: 12, 
        alignItems: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        minWidth: 150,
        flex: 1,
        maxWidth: '48%'
    },
    fullWidth: {
        maxWidth: '100%'
    },
    marginRight: {
        marginRight: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    }
});

export default RoundedButton;
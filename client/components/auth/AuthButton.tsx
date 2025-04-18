import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react';

type AuthButtonProps = {
  onPress: () => void;
  title: string;
};

export function AuthButton({ onPress, title }: AuthButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D67BAF',
    padding: 15,
    borderRadius: 10,
    marginTop: 45,
    marginBottom: 15,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
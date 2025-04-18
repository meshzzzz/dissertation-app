import { View, TextInput, StyleSheet, Text } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

type AuthInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isValid?: boolean;
  showValidation?: boolean;
  errorMessage?: string;
};

export function AuthInput({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  isValid,
  showValidation = false,
  errorMessage
}: AuthInputProps) {
  
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        {icon && (
          <View style={styles.iconContainer}>
            <Feather name={icon as any} size={18} color="#888" />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showValidation && value.length > 0 && (
          <Feather 
            name={isValid ? "check-circle" : "x-circle"} 
            color={isValid ? "green" : "red"} 
            size={20} 
            style={styles.validationIcon}
          />
        )}
      </View>
      {showValidation && value.length > 0 && !isValid && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#CCE0F5',
    flex: 1,
  },
  inputWithIcon: {
    paddingLeft: 45,
  },
  validationIcon: {
    position: 'absolute',
    right: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});
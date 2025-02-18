import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { onSignup } = useAuth();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const result = await onSignup!(email, password);
        if (!result?.error) {
            // signup successful
            Alert.alert('Success', 'Account created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/auth/login')
                }
            ]);
        } else {
            Alert.alert('Error', result.msg);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 15,
      marginBottom: 15,
      borderRadius: 5,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 5,
      marginBottom: 15,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    link: {
      color: '#007AFF',
      textAlign: 'center',
    },
  });

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import Feather from 'react-native-vector-icons/Feather';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [emailVerify, setEmailVerify] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [firstNameVerify, setFirstNameVerify] = useState(false);
    const [lastName, setLastName] = useState('');
    const [lastNameVerify, setLastNameVerify] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const { onSignup } = useAuth();
    const { colors } = useTheme(); 

    function handleFirstName(e: NativeSyntheticEvent<TextInputChangeEventData>) {
        const firstNameVar = e.nativeEvent.text;
        setLastName(firstNameVar);
        if (firstNameVar.length > 1) {
            setFirstNameVerify(true);
        }
    }

    const handleSubmit = async () => {
        if (!email || !password || !confirmPassword) {
            alert('All fields are required')
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match')
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
            <Text style={[styles.title, { color: colors.text }]}>Sign-Up</Text>
            
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="University Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
        
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="First Name"
                    onChangeText={(text) => {
                        setFirstName(text);
                        setFirstNameVerify(text.length > 1);
                    }}
                />
                {firstName.length > 0 && (
                    <Feather 
                        name={firstNameVerify ? "check-circle" : "x-circle"} 
                        color={firstNameVerify ? "green" : "red"} 
                        size={20} 
                        style={styles.icon}
                    />
                )}
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>
            
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
    inputWrapper: {
      position: 'relative',
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 15,
      marginBottom: 15,
      borderRadius: 5,
      paddingRight: 40,
    },
    icon: {
      position: 'absolute',
      right: 15,
      top: 15,
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

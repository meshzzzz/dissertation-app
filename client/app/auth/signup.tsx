import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, NativeSyntheticEvent, TextInputChangeEventData, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from 'axios';
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
    const [confirmPasswordVerify, setConfirmPasswordVerify] = useState(false);

    const { onSignup } = useAuth();
    const { colors } = useTheme(); 

    // password must be > 7 characters, contain at least one uppercase letter, lowercase letter, number and special character
    const validatePassword = (pass: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /[0-9]/.test(pass);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
        
        return pass.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }


    const handleSubmit = async () => {
        if (!email || !password || !confirmPassword || !firstName || !lastName) {
            alert('All fields are required')
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match')
            return;
        }

        if (firstNameVerify && lastNameVerify && emailVerify && passwordVerify && confirmPasswordVerify) {
            try {
                const response = await axios.post('http://192.168.1.225:5001/signup', {
                    email,
                    firstName,
                    lastName,
                    password
                });
                
                if (response.data.status === "ok") {
                    Alert.alert('Success', 'Account created successfully', [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/auth/login')
                        }
                    ]);
                } else {
                    Alert.alert('Error', response.data.data);
                }
            } catch (error) {
                console.error('Signup error:', error);
                Alert.alert('Error', 'Something went wrong. Please try again.');
            }
        }
        else {
            Alert.alert('Error', 'Please fill out all fields correctly.');
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <Text style={[styles.title, { color: colors.text }]}>Sign-Up</Text>
                        
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="University Email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailVerify(/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(text));
                                }}
                            />
                            {email.length > 0 && (
                                <Feather 
                                    name={emailVerify ? "check-circle" : "x-circle"} 
                                    color={emailVerify ? "green" : "red"} 
                                    size={20} 
                                    style={styles.icon}
                                />
                            )}
                        </View>
                        {email.length < 1 ? null : emailVerify ? null :
                        <Text
                            style={styles.errorText}>
                            Enter a valid email address.
                        </Text>}
                    
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
                        {firstName.length < 1 ? null : firstNameVerify ? null :
                        <Text
                            style={styles.errorText}>
                            First name should be more than 1 character.
                        </Text>}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Last Name"
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text);
                                    setLastNameVerify(text.length > 1);
                                }}
                            />
                            {lastName.length > 0 && (
                                <Feather 
                                    name={lastNameVerify ? "check-circle" : "x-circle"} 
                                    color={lastNameVerify ? "green" : "red"} 
                                    size={20} 
                                    style={styles.icon}
                                />
                            )}
                        </View>
                        {lastName.length < 1 ? null : lastNameVerify ? null :
                        <Text
                            style={styles.errorText}>
                            Last name should be more than 1 character.
                        </Text>}
                        
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    const isValid = validatePassword(text);
                                    setPasswordVerify(isValid);

                                    if (confirmPassword) {
                                        setConfirmPasswordVerify(confirmPassword === text && text.length > 0)
                                    }
                                }}
                                secureTextEntry
                            />
                            {password.length > 0 && (
                                <Feather 
                                    name={passwordVerify ? "check-circle" : "x-circle"} 
                                    color={passwordVerify ? "green" : "red"} 
                                    size={20} 
                                    style={styles.icon}
                                />
                            )}
                        </View>
                        {password.length < 1 ? null : passwordVerify ? null :
                        <Text
                            style={styles.errorText}>
                            Password must be at least 8 characters and contain at least one uppercase letter, 
                            lowercase letter, number, and special character.
                        </Text>}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setConfirmPasswordVerify(text === password && text.length > 0);
                                }}
                                secureTextEntry
                            />
                            {confirmPassword.length > 0 && (
                                <Feather 
                                    name={confirmPasswordVerify ? "check-circle" : "x-circle"} 
                                    color={confirmPasswordVerify ? "green" : "red"} 
                                    size={20} 
                                    style={styles.icon}
                                />
                            )}
                        </View>
                        {confirmPassword.length < 1 ? null : confirmPasswordVerify ? null :
                        <Text
                            style={styles.errorText}>
                            Passwords do not match.
                        </Text>}
                        
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text style={styles.link}>Already have an account? Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    errorText: {
      color: 'red',
      marginTop: -10,
      marginBottom: 10,
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

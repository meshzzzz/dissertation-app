import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthButton } from '@/components/auth/AuthButton';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthInput } from '@/components/auth/AuthInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onLogin } = useAuth();
    const { colors } = useTheme(); 

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        try {
            const result = await onLogin!(email, password);
            
            if (!result?.error) {
                console.log("Login successful");
            } else {
                Alert.alert('Error', result.msg || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    }

    return (
        <AuthContainer>
            <FormContainer title="Login">
                <Text style={styles.formTitle}>Please login to your account.</Text>
                <AuthInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    icon="user"
                    autoCapitalize='none'
                    keyboardType='email-address'
                />

                <AuthInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock"
                    secureTextEntry
                />

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>

                <AuthButton onPress={handleSubmit} title="Login" />
            </FormContainer>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account yet? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                    <Text style={styles.signupLink}>Sign-up here.</Text>
                </TouchableOpacity>
            </View>
        </AuthContainer>
    )
}

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 16,
        marginTop: 30,
        marginBottom: 20,
        color: '#555',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    forgotPassword: {
        fontSize: 14,
        color: '#666',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signupText: {
        fontSize: 14,
        color: '#555',
    },
    signupLink: {
        fontSize: 14,
        color: '#D67BAF',
        fontWeight: 'bold',
    },
});
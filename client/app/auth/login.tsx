import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthButton } from '@/components/auth/AuthButton';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthInput } from '@/components/auth/AuthInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { onLogin } = useAuth();

    const isValidEmail = (email: string) => {
        return /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(email);
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password are required');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const result = await onLogin!(email, password);

            setIsLoading(false);
            
            if (!result?.error) {
                console.log("Login successful");
                router.push('/');
            } else {
                Alert.alert('Login Failed', result.msg);
            }
        } catch (error) {
            setIsLoading(false);
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
                    isValid={email ? isValidEmail(email) : true}
                    showValidation={email.length > 0}
                    errorMessage="Please enter a valid email"
                />

                <AuthInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    icon="lock"
                    secureTextEntry
                />
                <AuthButton 
                    onPress={handleSubmit} 
                    title="Login"
                    isLoading={isLoading}
                    disabled={isLoading}
                />
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
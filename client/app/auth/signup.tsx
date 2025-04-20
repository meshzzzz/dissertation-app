import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SignupProvider } from '@/context/SignupContext';
import { AuthContainer } from '@/components/auth/AuthContainer';
import FormStep1 from '@/components/auth/FormStep1';
import FormStep2 from '@/components/auth/FormStep2';
import FormStep3 from '@/components/auth/FormStep3';
import { useSignup } from '@/context/SignupContext';

// render the current step
function StepRenderer() {
    const { currentStep } = useSignup();
    
    switch (currentStep) {
      case 1:
        return <FormStep1 />;
      case 2:
        return <FormStep2 />;
      case 3:
        return <FormStep3 />;
      default:
        return <FormStep1 />;
    }
}

// main function which uses the context
function SignupContent() {
    return (
      <AuthContainer>
        <StepRenderer />
        <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Login here.</Text>
            </TouchableOpacity>
        </View>
      </AuthContainer>
    );
}

// wrapper component that provides the context
export default function Signup() {
    return (
      <SignupProvider>
        <SignupContent />
      </SignupProvider>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    loginText: {
        fontSize: 14,
        color: '#555',
    },
    loginLink: {
        fontSize: 14,
        color: '#D67BAF',
        fontWeight: 'bold',
    },
});
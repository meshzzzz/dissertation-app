import { Text, StyleSheet, Alert } from 'react-native';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useSignup } from '@/context/SignupContext';

export default function FormStep1() {
    const { form, valid, handleChange, isStepValid, setCurrentStep } = useSignup();
  
    const handleNext = () => {
        if (isStepValid(1)) {
            setCurrentStep(2);
        } else {
            Alert.alert('Error', 'Please fill out all fields correctly.');
        }
    };
  
    return (
        <FormContainer title="Sign Up">
            <Text style={styles.formTitle}>My Info</Text>
            <AuthInput
                placeholder="University Email"
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                showValidation
                isValid={valid.email}
                errorMessage="Enter a valid email address."
            />
    
            <AuthInput
                placeholder="First Name"
                value={form.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                showValidation
                isValid={valid.firstName}
                errorMessage="First name should be more than 1 character."
            />
    
            <AuthInput
                placeholder="Last Name"
                value={form.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                showValidation
                isValid={valid.lastName}
                errorMessage='Last name should be more than 1 character.'
            />
    
            <AuthInput
                placeholder="Preferred Name"
                value={form.preferredName}
                onChangeText={(text) => handleChange('preferredName', text)}
                showValidation
                isValid={valid.preferredName}
                errorMessage="Preferred name should be more than 1 character."
            />
            <Text style={styles.helperText}>This is what will be displayed on your profile</Text>
    
            <AuthInput
                placeholder="Password"
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                showValidation
                isValid={valid.password}
                secureTextEntry
                errorMessage='Password must be at least 8 characters and contain at least one uppercase letter, 
                            lowercase letter, number, and special character.'
            />
    
            <AuthInput
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                showValidation
                isValid={valid.confirmPassword}
                secureTextEntry
                errorMessage='Passwords do not match.'
            />
            
            <AuthButton onPress={handleNext} title="Next" />
        </FormContainer>
    );
  }
  
  const styles = StyleSheet.create({
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#555',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        alignSelf: 'flex-start',
        marginTop: -8,
        marginBottom: 16,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
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
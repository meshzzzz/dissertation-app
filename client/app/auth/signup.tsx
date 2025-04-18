import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useReducer } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthButton } from '@/components/auth/AuthButton';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthInput } from '@/components/auth/AuthInput';

type FormFields = {
    email: string;
    firstName: string;
    lastName: string;
    preferredName: string;
    password: string;
    confirmPassword: string;
};
  
type ValidationFlags = {
    [K in keyof FormFields]: boolean;
};

const initialForm: FormFields = {
    email: '',
    firstName: '',
    lastName: '',
    preferredName: '',
    password: '',
    confirmPassword: '',
};

const initialValidation: ValidationFlags = {
    email: false,
    firstName: false,
    lastName: false,
    preferredName: false,
    password: false,
    confirmPassword: false,
};

function formReducer(state: FormFields, action: { field: keyof FormFields; value: string }) {
    return { ...state, [action.field]: action.value };
}
  
function validationReducer(state: ValidationFlags, action: { field: keyof ValidationFlags; value: boolean }) {
    return { ...state, [action.field]: action.value };
}

const validators: { [K in keyof FormFields]?: (value: string, form?: FormFields) => boolean } = {
    email: (val) => /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(val),
    firstName: (val) => val.length > 1,
    lastName: (val) => val.length > 1,
    preferredName: (val) => val.length > 1,
    password: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val),
    confirmPassword: (val, form) => val === form?.password && val.length > 0,
  };

export default function Signup() {
    const { onSignup } = useAuth();

    const [form, dispatchForm] = useReducer(formReducer, initialForm);
    const [valid, dispatchValid] = useReducer(validationReducer, initialValidation);

    const handleChange = (field: keyof FormFields, value: string) => {
        dispatchForm({ field, value });
    
        const validate = validators[field];
        if (validate) {
          const isValid = validate(value, { ...form, [field]: value });
          dispatchValid({ field, value: isValid });
        }
    };
    


    const handleSubmit = async () => {
        const allValid = Object.values(valid).every(Boolean);
    
        if (!allValid) {
          Alert.alert('Error', 'Please fill out all fields correctly.');
          return;
        }
    
        const response = await onSignup!(
          form.email,
          form.firstName,
          form.lastName,
          form.password
        );
    
        if (!response.error && response.data?.status === 'ok') {
          Alert.alert('Success', 'Account created successfully', [
            { text: 'OK', onPress: () => router.replace('/auth/login') },
          ]);
        } else {
          Alert.alert('Error', response.msg || response.data?.data || 'Signup failed');
        }
    };

    return (
        <AuthContainer>
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
                
                <AuthButton onPress={handleSubmit} title="Next" />
            </FormContainer>
            <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                    <Text style={styles.loginLink}>Login here.</Text>
                </TouchableOpacity>
            </View>
        </AuthContainer>
    )
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

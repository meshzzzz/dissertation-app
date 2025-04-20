import { View, Text, StyleSheet, Alert } from 'react-native';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useSignup } from '@/context/SignupContext';

export default function FormStep2() {
    const { form, valid, handleChange, isStepValid, setCurrentStep } = useSignup();

    const handleNext = () => {
        if (isStepValid(2)) {
            setCurrentStep(3);
        } else {
            Alert.alert('Error', 'Please fill out all fields correctly.');
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    return (
        <FormContainer title="Sign Up">
            <Text style={styles.formTitle}>My Academic Details</Text>
            
            {/* !! currently free entry - could make this a dropdown if time later */}
            <AuthInput
                placeholder="Course of Study"
                value={form.courseOfStudy}
                onChangeText={(text) => handleChange('courseOfStudy', text)}
                showValidation
                isValid={valid.courseOfStudy}
                errorMessage="Please enter your course of study."
            />

            <AuthInput
                placeholder="Year of Entry (e.g., 2023)"
                value={form.yearOfEntry}
                onChangeText={(text) => handleChange('yearOfEntry', text)}
                keyboardType="numeric"
                showValidation
                isValid={valid.yearOfEntry}
                errorMessage="Please enter a valid year (2000 or later)."
            />

            <AuthInput
                placeholder="Expected Year of Graduation"
                value={form.yearOfGraduation}
                onChangeText={(text) => handleChange('yearOfGraduation', text)}
                keyboardType="numeric"
                showValidation
                isValid={valid.yearOfGraduation}
                errorMessage="Graduation year must be after your year of entry."
            />
            
            <View style={styles.buttonContainer}>
                <AuthButton 
                    onPress={handleBack} 
                    title="Back" 
                    style={styles.backButton}
                    textStyle={styles.backButtonText}
                />
                <View style={styles.buttonSpacer} />
                <AuthButton 
                    onPress={handleNext} 
                    title="Next" 
                    style={styles.nextButton}
                />
            </View>
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D67BAF',
    },
    nextButton: {
        flex: 1,
    },
    backButtonText: {
        color: '#D67BAF',
    },
    buttonSpacer: {
        width: 10,
    },
});
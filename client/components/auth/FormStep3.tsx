import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { FormContainer } from '@/components/auth/FormContainer';
import { AuthButton } from '@/components/auth/AuthButton';
import { useSignup } from '@/context/SignupContext';
import { useState, useEffect } from 'react';

// !! placeholder interests (could make database driven?)
const INTERESTS = [
    { id: '1', emoji: '🐶', label: 'Animals' },
    { id: '2', emoji: '🎵', label: 'Music' },
    { id: '3', emoji: '💃', label: 'Dancing' },
    { id: '4', emoji: '🏙️', label: 'Days out' },
    { id: '5', emoji: '📚', label: 'Books' },
    { id: '6', emoji: '🍳', label: 'Cooking' },
    { id: '7', emoji: '🎬', label: 'Movies' },
    { id: '8', emoji: '🎮', label: 'Gaming' },
    { id: '9', emoji: '🏃', label: 'Sports' },
    { id: '10', emoji: '✈️', label: 'Travel' },
    { id: '11', emoji: '🎨', label: 'Art' },
    { id: '12', emoji: '📷', label: 'Photography' },
]

export default function FormStep3() {
    const { onSignup } = useAuth();
    const { form, setCurrentStep, setInterests } = useSignup();

    // state for tracking selected interests
    const [selectedInterests, setSelectedInterests] = useState<string[]>(form.interests || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // update state when selections change
    useEffect(() => {
        setInterests(selectedInterests);
    }, [selectedInterests]);

    const handleInterestToggle = (interestId: string) => {
        setSelectedInterests(prev => {
            // if interest already selected, remove it
            if (prev.includes(interestId)) {
                return prev.filter(id => id !== interestId);
            }
            
            // if interest not already selected and less than 5 selected, add it
            if (prev.length < 5) {
                return [...prev, interestId];
            }
            
            // if trying to select more than 5 interests, show alert and return unchanged
            Alert.alert('Maximum Interests', 'You can select up to 5 interests');
            return prev;
        });
    };

    const handleBack = () => {
        setCurrentStep(2);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        try {
            const response = await onSignup!(
                form.email,
                form.firstName,
                form.lastName,
                form.preferredName,
                form.password,
                form.courseOfStudy,
                form.yearOfEntry,
                form.yearOfGraduation,
                form.interests
            );
    
            if (!response.error && response.data?.status === 'ok') {
                Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.replace('/auth/login') },
                ]);
            } else {
                Alert.alert('Error', response.msg || response.data?.data || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormContainer title="Sign Up">
            <Text style={styles.description}>
                Select up to 5 interests to help you meet likeminded people
            </Text>

            <View style={styles.interestsContainer}>
                {INTERESTS.map((interest) => (
                    <TouchableOpacity
                        key={interest.id}
                        style={[
                            styles.interestItem,
                            selectedInterests.includes(interest.id) && styles.selectedInterest
                        ]}
                        onPress={() => handleInterestToggle(interest.id)}
                    >
                        <Text style={styles.emoji}>{interest.emoji}</Text>
                        <Text style={[
                            styles.interestLabel,
                            selectedInterests.includes(interest.id) && styles.selectedInterestText
                        ]}>
                            {interest.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.selectionCount}>
                {selectedInterests.length} of 5 selected
            </Text>

            <View style={styles.buttonContainer}>
                <AuthButton 
                    onPress={handleBack} 
                    title="Back" 
                    style={styles.backButton}
                    textStyle={styles.backButtonText}
                    disabled={isSubmitting}
                />
                <View style={styles.buttonSpacer} />
                <AuthButton 
                    onPress={handleSubmit} 
                    title="Create Account" 
                    style={styles.submitButton}
                    isLoading={isSubmitting}
                />
            </View>
        </FormContainer>
    );
}

const styles = StyleSheet.create({
    description: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 15,
    },
    interestItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#A8C4DD',
      borderRadius: 25,
      paddingVertical: 8,
      paddingHorizontal: 15,
      margin: 5,
    },
    selectedInterest: {
      backgroundColor: '#D67BAF',
    },
    emoji: {
      fontSize: 16,
      marginRight: 6,
    },
    interestLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'white',
    },
    selectionCount: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
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
    submitButton: {
      flex: 1,
    },
    backButtonText: {
      color: '#D67BAF',
    },
    buttonSpacer: {
      width: 10,
    },
});
  
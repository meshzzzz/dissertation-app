import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView, 
    Platform, 
    Modal, 
    TouchableOpacity, 
    TextInput, 
    StyleSheet, 
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import { COUNTRIES } from '@/constants/CountryData';
import { QMUL_CAMPUSES } from '@/constants/CampusData';
import { QMUL_ACCOMMODATIONS } from '@/constants/AccomodationData';

interface EditProfileModalProps {
    modalVisible: boolean;
    onClose: () => void;
    userData: {
        name: string;
        aboutMe: string;
        widgets: {
            country: string;
            campus: string;
            accomodation: string;
        };
    };
    onUpdateSuccess: () => void;
    onPhotoEditRequest: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    modalVisible,
    onClose,
    userData,
    onUpdateSuccess,
    onPhotoEditRequest
}) => {
    const colorScheme = useColorScheme();
    const { authState } = useAuth();
    const accentColor = Colors[colorScheme ?? 'light'].secondary;
    
    const [name, setName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [country, setCountry] = useState('');
    const [countryOpen, setCountryOpen] = useState(false);
    const [campus, setCampus] = useState('');
    const [campusOpen, setCampusOpen] = useState(false);
    const [accomodation, setAccomodation] = useState('');
    const [accomodationOpen, setAccomodationOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (modalVisible && userData) {
            setName(userData.name || '');
            setAboutMe(userData.aboutMe || '');
            
            if (userData.widgets) {
                setCountry(userData.widgets.country || '');
                setCampus(userData.widgets.campus || '');
                setAccomodation(userData.widgets.accomodation || '');
            }
        }
    }, [userData, modalVisible]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/update-profile`, {
                token: authState?.token,
                preferredName: name,
                aboutMe: aboutMe,
                country: country,
                campus: campus,
                accomodation: accomodation
            });
            
            if (response.data?.status !== 'ok') {
                throw new Error(response.data?.message || 'Failed to update profile');
            }
            
            onUpdateSuccess();
            onClose();
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Update profile error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            visible={modalVisible}
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={styles.container}
                    lightColor={Colors.overlay}
                    darkColor={Colors.overlay}
                >
                
                    <View
                        style={styles.modalContent}
                        lightColor="#FFFFFF"
                        darkColor="#1F2937"
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.keyboardView}
                        >
                            <ScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={styles.header}>
                                    <Text style={styles.title}>Edit Profile</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity 
                                    style={styles.photoEditButton}
                                    onPress={onPhotoEditRequest}
                                >
                                    <Ionicons name="camera" size={20} color="#fff" />
                                    <Text style={styles.photoEditText}>Change Profile Photo</Text>
                                </TouchableOpacity>

                                {/* name field */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { color: colorScheme === 'dark' ? '#fff' : '#000' }
                                        ]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Your name"
                                        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                                    />
                                </View>

                                {/* about me field */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>About me</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.textArea,
                                            { color: colorScheme === 'dark' ? '#fff' : '#000' }
                                        ]}
                                        value={aboutMe}
                                        onChangeText={(text) => {
                                            if (text.length <= 100) {
                                                setAboutMe(text);
                                            }
                                        }}
                                        placeholder="Tell us about yourself (max 100 characters)"
                                        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* country field */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Nationality</Text>
                                    <DropDownPicker
                                        open={countryOpen}
                                        value={country}
                                        items={COUNTRIES}
                                        setOpen={setCountryOpen}
                                        setValue={setCountry}
                                        placeholder="Select your nationality"
                                        searchable
                                        onOpen={() => {
                                            setCampusOpen(false);
                                            setAccomodationOpen(false);
                                            Keyboard.dismiss();
                                        }}
                                        searchPlaceholder="Search for a country..."
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        textStyle={styles.dropdownText}
                                        searchTextInputStyle={styles.searchInput}
                                        listMode="SCROLLVIEW"    
                                        maxHeight={200}
                                        zIndex={3000}
                                    />
                                </View>

                                {/* campus field */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Campus</Text>
                                    <DropDownPicker
                                        open={campusOpen}
                                        value={campus}
                                        items={QMUL_CAMPUSES}
                                        setOpen={setCampusOpen}
                                        setValue={setCampus}
                                        placeholder="Select your campus"
                                        onOpen={() => {
                                            setCountryOpen(false);
                                            setAccomodationOpen(false);
                                            Keyboard.dismiss();
                                        }}
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        textStyle={styles.dropdownText}
                                        listMode="SCROLLVIEW"    
                                        maxHeight={200}
                                        zIndex={2000}
                                    />
                                </View>

                                {/* accommodation field */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Accommodation</Text>
                                    <DropDownPicker
                                        open={accomodationOpen}
                                        value={accomodation}
                                        items={QMUL_ACCOMMODATIONS}
                                        setOpen={setAccomodationOpen}
                                        setValue={setAccomodation}
                                        placeholder="Select your accommodation"
                                        onOpen={() => {
                                            setCountryOpen(false);
                                            setCampusOpen(false);
                                            Keyboard.dismiss();
                                        }}
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        textStyle={styles.dropdownText}
                                        searchTextInputStyle={styles.searchInput}
                                        maxHeight={200}
                                        listMode="SCROLLVIEW"    
                                        zIndex={1000}
                                        zIndexInverse={3000}
                                    />
                                </View>

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={onClose}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.button, 
                                            styles.saveButton,
                                            { backgroundColor: accentColor }
                                        ]}
                                        onPress={handleSave}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    photoEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#578BBB',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
    },
    photoEditText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    },
    dropdown: {
        borderColor: '#ddd',
        borderRadius: 8,
        minHeight: 50,
    },
    dropdownContainer: {
        borderColor: '#ddd',
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 16,
    },
    searchInput: {
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        marginLeft: 10,
    },
    cancelButtonText: {
        fontWeight: '500',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default EditProfileModal;
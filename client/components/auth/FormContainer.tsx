import { View, Text, StyleSheet } from 'react-native';
import React, { ReactNode } from 'react';
import { Image } from 'react-native';

type FormContainerProps = {
  children: ReactNode;
  title: string;
};

export function FormContainer({ children, title }: FormContainerProps) {
  return (
    <View style={styles.container}>
        <View style={styles.formContainer}>
            {children}
        </View>

        <View style={styles.headerContainer}>
            <View style={styles.glowWrapper}>
                <Image source={require('../../assets/auth/authHeaderCircle.png')} style={styles.glowPng}/>
                <View style={styles.textWrapper}>
                    <Text style={styles.headerText}>{title}</Text>
                </View>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginTop: 75, 
        position: 'relative',
    },
    headerContainer: {
        alignItems: 'center',
        position: 'absolute',
        top: -90, 
        width: '100%',
    },
    textWrapper: {
        position: 'absolute',
        top: 45, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowPng: {
        width: 180,
        height: 180,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        zIndex: 1,
    },
    formContainer: {
        backgroundColor: '#E0EAF3',
        padding: 20,
        width: '100%',
        paddingTop: 30,
        zIndex: 1,
    },
});
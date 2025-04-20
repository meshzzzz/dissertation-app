import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onSignup?: (
        email: string, 
        firstName: string, 
        lastName: string, 
        preferredName: string,
        password: string,
        courseOfStudy: string,
        yearOfEntry: string,
        yearOfGraduation: string,
        interests: string[]
    ) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
export const API_URL = 'http://192.168.1.225:5001';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null
    })

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log("stored token: ", token);
            if (token) {
                setAuthState({
                    token: token,
                    authenticated: true
                })
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            else {
                setAuthState({
                    token: null,
                    authenticated: false,
                })
            }
        }
        loadToken();
    }, [])

    const signup = async (
        email: string, 
        firstName: string, 
        lastName: string, 
        preferredName: string,
        password: string,
        courseOfStudy: string,
        yearOfEntry: string,
        yearOfGraduation: string,
        interests: string[]
    ) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                firstName,
                lastName,
                preferredName,
                password,
                courseOfStudy,
                yearOfEntry,
                yearOfGraduation,
                interests
            });
            return response;
        } catch (e) {
            return { error: true, msg: (e as any).response.data.msg || "Signup failed" }
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const result = await axios.post(`${API_URL}/login`, {email, password});
            setAuthState({
                token: result.data.token,
                authenticated: true
            })

            axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;

            await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
            return result

        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.data || "Login failed"}
        }
    }

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        axios.defaults.headers.common['Authorization'] = '';
        setAuthState({
            token: null,
            authenticated: false
        })
    }

    const value = {
        onSignup: signup,
        onLogin: login,
        onLogout: logout,
        authState
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
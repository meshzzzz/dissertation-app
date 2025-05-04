import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types/User';

interface AuthProps {
    authState?: {
        token: string | null; 
        authenticated: boolean | null;
        user: User | null;
    };
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
const USER_DATA_KEY = 'user-data';
export const API_URL = 'http://192.168.1.225:5001';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
        user: User | null;
    }>({
        token: null,
        authenticated: null,
        user: null
    })

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
            console.log("stored token: ", token);
            if (token) {
                let user = null;
                if (userData) {
                    try {
                        user = JSON.parse(userData);
                    } catch (e) {
                        console.error("Error parsing user data", e);
                    }
                }
                setAuthState({
                    token: token,
                    authenticated: true,
                    user: user
                })
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            else {
                setAuthState({
                    token: null,
                    authenticated: false,
                    user: null
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

            // only set auth state on successful login
            if (result.data.status === 'ok' && result.data.token) {
                const userData = result.data.user;

                if (userData) {
                    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
                }

                setAuthState({
                    token: result.data.token,
                    authenticated: true,
                    user: userData
                })

                axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;
                await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);

                return { error: false, data: result.data };
            } else {
                return { error: true, msg: result.data.data};
            }

        } catch (e) {
            const errorMessage = (e as any).response?.data?.data;
            return { error: true, msg: errorMessage };
        }
    }

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
        axios.defaults.headers.common['Authorization'] = '';
        setAuthState({
            token: null,
            authenticated: false,
            user: null
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
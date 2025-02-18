import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

export default function AuthLayout() {
  const { authState } = useAuth();
  const colorScheme = useColorScheme();

  // If the user is authenticated, redirect to the main app
  if (authState?.authenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Create Account',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
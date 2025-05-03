import "react-native-gesture-handler";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { PostsProvider } from "@/context/PostContext";
import { CommentProvider } from "@/context/CommentContext";
import { EventProvider } from "@/context/EventContext";
import "../global.css";
import Colors from "@/constants/Colors";
import { ChatProvider } from "@/context/ChatContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('../assets/fonts/Inter-Regular.ttf'),
    LondrinaShadow: require('../assets/fonts/LondrinaShadow-Regular.ttf'),
    Itim: require('../assets/fonts/Itim-Regular.otf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      accent: Colors.light.secondary,
      background: Colors.light.background,
      card: Colors.light.background,
      text: Colors.light.text,
      border: Colors.light.tabIconDefault,
      notification: Colors.light.primary,
      profile: Colors.light.profile,
    },
  };
  
  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      accent: Colors.dark.secondary,
      background: Colors.dark.background,
      card: Colors.dark.background,
      text: Colors.dark.text,
      border: Colors.dark.tabIconDefault,
      notification: Colors.dark.primary,
      profile: Colors.dark.profile,
    },
  };

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>   
        <AuthProvider>
            <ChatProvider>
                <EventProvider>
                    <PostsProvider>
                        <CommentProvider>
                            <Slot />
                        </CommentProvider>
                    </PostsProvider>
                </EventProvider>
            </ChatProvider>
        </AuthProvider>
    </ThemeProvider>
  );
}
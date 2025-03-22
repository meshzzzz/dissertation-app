import { useAuth } from "@/context/AuthContext";
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Alert, View } from "react-native";
import ThemeToggle from "./ThemeToggle";

export default function CustomDrawerContent(props: any) {
    const { onLogout } = useAuth();
    const { colors } = useTheme();

    const handleLogout = async () => {
        try {
            const result = await onLogout!();
            
            if (!result?.error) {
                console.log("Logout successful");
            } else {
                Alert.alert('Error', result.msg || 'Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    }

    return  (
        <View style={{flex: 1}}>
            <DrawerContentScrollView
            {...props}
            scrollEnabled={false}
            contentContainerStyle={{
                backgroundColor: colors.card,
            }}
            >
                <DrawerItemList {...props} />
                <DrawerItem 
                    label={"Logout"} 
                    onPress={handleLogout}
                    labelStyle={{color: colors.text}} 
                />
            </DrawerContentScrollView>
            <View className="absolute bottom-0 pb-10 items-center">
                <ThemeToggle />
            </View>
        </View>
    )
}



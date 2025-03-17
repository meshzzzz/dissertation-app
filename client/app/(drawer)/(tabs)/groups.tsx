import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { API_URL, useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function GroupsScreen() {
    const { authState } = useAuth();
    const [userData, setUserData] = useState('');

    async function getData() {
        if (authState?.token) {
            try {
              const response = await axios.post(`${API_URL}/userdata`, {
                token: authState.token
              });
              console.log(response.data);
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
    }

    useEffect(() => {
        getData();
    }, [authState]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/groups.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

import { FlatList, StyleSheet, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { ExternalLink } from '@/components/ExternalLink';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const rules = [
  {
    title: 'Treat others with respect',
    description:
      'QLink is a supportive, diverse and inclusive application, where we expect you to be friendly and considerate towards others. Any inappropriate behaviour or abusive content will be removed from the app and the responsible user banned. They may also be reported to university management and/or the relevant authorities.',
  },
  {
    title: 'Provide appropriate content',
    description:
      'Do not post any content or link to material on other sites which could be deemed inappropriate or likely to cause offence. Do not instigate or promote misinformation.',
  },
  {
    title: 'Privacy',
    description:
      'Do not post any personal email addresses or phone numbers on public forums or via private messaging, and do not share personal information that may be deemed sensitive.',
  },
  {
    title: 'Moderation',
    description:
      'To safeguard all users we have a system of moderation in place and moderators may edit, delete or move any content posted on the app. You can report any concerns to the app Moderators.',
  },
];


export default function About() {
    const { authState } = useAuth();

    if (authState?.authenticated === false) {
        return <Redirect href="/auth/login" />;
    }
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>About QLink</Text>
            <Text style={styles.text}>
                QLink aims to connect students with similar interests in order to provide a welcoming 
                and supportive environment for collaboration and sharing of information. Students can 
                join groups where you can chat, post information, and find out about events. You can 
                also discover sources of support and communications from the university via the university 
                affiliated QMUL group.
            </Text>

            <Text style={styles.subtitle}>App Rules</Text>
            <Text style={styles.text}>
                By using QLink you agree to follow our app guidelines and rules:
            </Text>

            <FlatList
                data={rules}
                keyExtractor={(item) => item.title}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.bulletContainer}>
                        <Text style={styles.bullet}>{'\u2022'}</Text>
                        <View style={styles.bulletTextContainer}>
                            <Text style={styles.bulletTitle}>{item.title}</Text>
                            <Text style={styles.text}>{item.description}</Text>
                        </View>
                    </View>
                )}
            />

            <Text style={styles.subtitle}>Privacy Notice</Text>
            <Text style={styles.text}>
                QLink respects your privacy and is committed to protecting your personal data. By using the app you 
                consent to the processing of your personal data. Any and all data collected or processed during the 
                course of using the application is managed in accordance with the university data privacy policy, which 
                can be found in full here:
            </Text>
            <ExternalLink href="https://www.qmul.ac.uk/privacy/">
                <Text style={styles.link}>https://www.qmul.ac.uk/privacy/</Text>
            </ExternalLink>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    bulletContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 18,
        marginRight: 8,
    },
    bulletTextContainer: {
        flex: 1,
    },
    bulletTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    link: {
        color: '#00529C',
        textDecorationLine: 'underline',
    },
});

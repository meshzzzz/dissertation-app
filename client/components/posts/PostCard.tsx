import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_PFP } from '@/constants/DefaultImages';
import { usePosts } from '@/context/PostContext';

interface PostProps {
    id: string;
    showInFeed?: boolean;
    onPress?: () => void;
    onComment?: () => void;
    isInPostPage?: boolean;
}

const PostCard = ({
    id,
    showInFeed = false,
    onPress,
    onComment,
    isInPostPage = false
}: PostProps) => {
    const { postsById, toggleLike } = usePosts();
    const colorScheme = useColorScheme();
    const textColor = Colors[colorScheme ?? 'light'].text;
    const secondaryColor = Colors[colorScheme ?? 'light'].secondary;
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    
    // get post data from context
    const post = postsById[id];
    if (!post) return null;
    const { title, content, createdAt, author, group, comments, likes, userHasLiked } = post;

    // handle like button press
    const handleLike = async () => {
        if (isLikeLoading) return;
        
        setIsLikeLoading(true);
        try {
            await toggleLike(id);
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleCommentPress = () => {
        if (onComment) {
            onComment();
        }
    };

    const cardContent = (
        <>
            {/* title and time */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{title || content.split('\n')[0]}</Text>
                    <Text style={styles.timeAgo}>
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                    </Text>
                </View>
                
                {/* group tag - only shown in feed context */}
                {showInFeed && group && (
                    <View style={[styles.groupTag, { backgroundColor: secondaryColor }]}>
                    <Text style={styles.groupTagText}>{group.name}</Text>
                    </View>
                )}
            </View>
            
            {/* post content */}
            <Text style={[styles.content, { color: textColor }]}>
                {title ? content : content.split('\n').slice(1).join('\n')}
            </Text>
            
            {/* footer with author and actions */}
            <View style={styles.footer}>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleLike}
                        disabled={isLikeLoading}
                    >
                        <Ionicons
                            name={userHasLiked ? 'heart' : 'heart-outline'}
                            size={20}
                            color={userHasLiked ? '#F54E42' : textColor}
                        />
                        <Text style={[styles.actionText, userHasLiked ? { color: '#F54E42' } : {color: textColor}]}>
                            {likes}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCommentPress}>
                        <Ionicons name="chatbubble-outline" size={20} color={textColor} />
                        <Text style={styles.actionText}>{comments}</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.author}>
                    <Text style={styles.authorName}>{author.name}</Text>
                        <Image 
                        source={{ uri: author.profileImage || DEFAULT_PFP }} 
                        style={styles.authorImage}
                    />
                </View>
            </View>
        </>
    );

    if (isInPostPage) {
        return <View style={styles.container}>{cardContent}</View>;
    } else {
        return (
            <TouchableOpacity 
                style={styles.container}
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                {cardContent}
            </TouchableOpacity>
        )
    }
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        backgroundColor: '#EEF2F6'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    timeAgo: {
        fontSize: 8,
        opacity: 0.6,
    },
    groupTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupTagText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '500',
    },
    content: {
        fontSize: 10,
        lineHeight: 22,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    author: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorImage: {
        width: 28,
        height: 28,
        borderRadius: 16,
    },
    authorName: {
        fontSize: 8,
        opacity: 0.6,
        marginRight: 10,
    },
    actions: {
        flexDirection: 'row',
        opacity: 0.6,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    actionText: {
        marginLeft: 4,
        fontSize: 10,
    },
});

export default PostCard;

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_PFP } from '@/constants/DefaultImages';
import { usePosts } from '@/context/PostContext';
import { usePermissions } from '@/hooks/usePermissions';

interface PostProps {
    id: string;
    showGroup?: boolean;
    onPress?: () => void;
    onComment?: () => void;
    isInPostPage?: boolean;
    onDeleted?: () => void;
}

const PostCard = ({
    id,
    showGroup = false,
    onPress,
    onComment,
    isInPostPage = false,
    onDeleted
}: PostProps) => {
    const { canDeleteContent } = usePermissions();
    const { postsById, toggleLike, deletePost } = usePosts();
    const colorScheme = useColorScheme();
    const textColor = Colors[colorScheme ?? 'light'].text;
    const secondaryColor = Colors[colorScheme ?? 'light'].secondary;
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // same color as profile background - light posts on a black background are a bit blinding
    const postBgColor = colorScheme === 'dark' ? '#1E3A5F' : '#EEF2F6';
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

     // handle delete post
     const handleDeletePost = () => {
        if (isDeleteLoading) return;

        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleteLoading(true);
                        try {
                            const success = await deletePost(id);
                            if (success && onDeleted) {
                                onDeleted();
                            }
                        } finally {
                            setIsDeleteLoading(false);
                        }
                    }
                }
            ]
        );
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
                
                {/* group tag and delete button container */}
                <View style={styles.headerRight}>
                    {/* group tag - only shown in feed context */}
                    {showGroup && group && (
                        <View style={[styles.groupTag, { backgroundColor: secondaryColor }]}>
                            <Text style={styles.groupTagText}>{group.name}</Text>
                        </View>
                    )}
                    
                    {/* delete button - shown for author or superuser */}
                    {canDeleteContent(author.id) && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeletePost}
                            disabled={isDeleteLoading}
                        >
                            <Ionicons name="trash-outline" size={16} color="#F54E42" />
                        </TouchableOpacity>
                    )}
                </View>
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
        return <View style={[styles.container, {backgroundColor: postBgColor}]}>{cardContent}</View>;
    } else {
        return (
            <TouchableOpacity 
                style={[styles.container, {backgroundColor: postBgColor}]}
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
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
    deleteButton: {
        padding: 4,
    }
});

export default PostCard;

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { DEFAULT_PFP } from '@/constants/DefaultImages';
import { CommentTreeNode } from '@/types/Comment';
import { usePermissions } from '@/hooks/usePermissions';

interface CommentContentProps {
    comment: CommentTreeNode;
    textColor: string;
    onLike: () => void;
    onReply: () => void;
    onDelete: () => void;
    isLikeLoading: boolean;
    isDeleting: boolean;
}

const CommentContent = ({
    comment,
    textColor,
    onLike,
    onReply,
    onDelete,
    isLikeLoading,
    isDeleting
}: CommentContentProps) => {
    const { canDeleteContent } = usePermissions();
    const { id, content, createdAt, author, likes, userHasLiked } = comment;

    return (
        <>
            {/* comment header */}
            <View style={styles.header}>
                <View style={styles.authorContainer}>
                    <Image 
                        source={{ uri: author.profileImage || DEFAULT_PFP }} 
                        style={styles.authorImage} 
                    />
                    <Text style={styles.authorName}>{author.name}</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.timeAgo}>
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                    </Text>
                    
                    {/* Delete button - only visible for author */}
                    {canDeleteContent(author.id) && (
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={onDelete}
                            disabled={isDeleting}
                        >
                            <Ionicons name="trash-outline" size={16} color="#F54E42" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            {/* comment content */}
            <Text style={[styles.content, { color: textColor }]}>
                {content}
            </Text>
            
            {/* comment actions */}
            <View style={styles.actionsContainer}>
                {/* like button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onLike}
                    disabled={isLikeLoading}
                >
                    <Ionicons
                        name={userHasLiked ? 'heart' : 'heart-outline'}
                        size={16}
                        color={userHasLiked ? '#F54E42' : textColor}
                    />
                    {likes > 0 && (
                        <Text style={[styles.actionText, userHasLiked && styles.likedText]}>
                            {likes}
                        </Text>
                    )}
                </TouchableOpacity>
                
                {/* reply button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onReply}
                >
                    <Ionicons name="chatbubble-outline" size={16} color={textColor} />
                    <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    authorName: {
        fontWeight: '600',
        fontSize: 10,
    },
    timeAgo: {
        fontSize: 8,
        color: '#888',
        opacity: 0.6,
        marginRight: 10
    },
    content: {
        fontSize: 10,
        lineHeight: 18,
        marginBottom: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        opacity: 0.6,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        fontSize: 8,
        marginLeft: 4,
        color: '#666',
    },
    likedText: {
        color: '#F54E42',
    },
    deleteButton: {
        padding: 4,
    },
});

export default CommentContent;
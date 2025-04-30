import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CommentTreeNode } from '@/types/Comment';
import { useComments } from '@/context/CommentContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import CommentContent from './CommentContent';
import RepliesSection from './RepliesSection';

interface CommentCardProps {
    comment: CommentTreeNode;
    postId: string;
    onReply?: (commentId: string, authorName: string) => void;
    isReply?: boolean;
}

const CommentCard = ({ 
    comment,
    postId,
    onReply,
    isReply = false, 
}: CommentCardProps) => {
    const { id, author, replies } = comment;
    const colorScheme = useColorScheme();
    const textColor = Colors[colorScheme ?? 'light'].text;
    const secondaryColor = Colors[colorScheme ?? 'light'].secondary;

    const { toggleLike } = useComments();

    // local state
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    const handleLike = async () => {
        if (isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            await toggleLike(id, postId);
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleReplyPress = () => {
        if (onReply) {
            onReply(id, author.name);
        }
    };
  
    const handleToggleReplies = () => {
        setShowReplies(prev => !prev);
    };

    // renderer for reply items (to be passed to RepliesSection)
    const renderReply = (reply: CommentTreeNode) => (
        <CommentCard
            key={reply.id}
            postId={postId}
            comment={reply}
            isReply={true}
            onReply={onReply}
        />
    );
  
    // render replies without an outer box of their own
    if (isReply) {
        return (
            <View style={styles.replyWrapper}>
                <View style={styles.replyDivider} />
                
                {/* reply content */}
                <View style={styles.replyContent}>
                    <CommentContent
                        comment={comment}
                        textColor={textColor}
                        onLike={handleLike}
                        onReply={handleReplyPress}
                        isLikeLoading={isLikeLoading}
                    />
                    
                    {/* nested replies section */}
                    {replies.length > 0 && (
                        <View style={styles.nestedRepliesSection}>
                            <RepliesSection
                                replies={replies}
                                showReplies={showReplies}
                                secondaryColor={secondaryColor}
                                onToggleReplies={handleToggleReplies}
                                renderReply={renderReply}
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // render parent comment with a box around it
    return (
        <View style={styles.container}>
            {/* comment card content wrapped in box */}
            <View style={styles.commentBox}>
                <CommentContent
                    comment={comment}
                    textColor={textColor}
                    onLike={handleLike}
                    onReply={handleReplyPress}
                    isLikeLoading={isLikeLoading}
                />
                
                {/* replies section */}
                <RepliesSection
                    replies={replies}
                    showReplies={showReplies}
                    secondaryColor={secondaryColor}
                    onToggleReplies={handleToggleReplies}
                    renderReply={renderReply}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    commentBox: {
        backgroundColor: '#f6eef5',
        borderRadius: 16,
        padding: 16,
    },
    nestedRepliesSection: {
        paddingLeft: 8,
    },
    replyWrapper: {
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 4,
    },
    replyDivider: {
        width: 2,
        backgroundColor: '#DDD',
        marginRight: 12,
    },
    replyContent: {
        flex: 1,
    },
});

export default CommentCard;
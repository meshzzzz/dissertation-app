import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { CommentTreeNode } from '@/types/Comment';

interface RepliesSectionProps {
    replies: CommentTreeNode[];
    showReplies: boolean;
    secondaryColor: string;
    onToggleReplies: () => void;
    renderReply: (reply: CommentTreeNode) => React.ReactNode;
}

const RepliesSection = ({
    replies,
    showReplies,
    secondaryColor,
    onToggleReplies,
    renderReply,
}: RepliesSectionProps) => {
    const hasReplies = replies.length > 0;
    
    if (!hasReplies) return null;
    
    return (
        <>
            <TouchableOpacity 
                style={styles.viewRepliesButton}
                onPress={onToggleReplies}
            >
                <View style={styles.viewRepliesLine} />
                <Text style={[styles.viewRepliesText, { color: secondaryColor }]}>
                    {showReplies ? 'Hide replies' : `View ${replies.length || ''} replies`}
                </Text>
                <Ionicons 
                    name={showReplies ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={secondaryColor} 
                />
            </TouchableOpacity>
            
            {showReplies && (
                <View style={styles.repliesContainer}>
                    {replies.map(reply => renderReply(reply))}
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    viewRepliesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    viewRepliesLine: {
        width: 24,
        height: 1,
        backgroundColor: '#DDD',
        marginRight: 8,
    },
    viewRepliesText: {
        fontSize: 10,
        marginRight: 4,
    },
    repliesContainer: {
        marginTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#DDD',
        paddingTop: 8,
    },
});

export default RepliesSection;
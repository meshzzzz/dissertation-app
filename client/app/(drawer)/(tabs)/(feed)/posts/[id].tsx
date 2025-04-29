import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PostScreen from '@/components/posts/PostScreen';

export default function FeedPostScreen() {
    const params = useLocalSearchParams();
    const postId = params.id as string;

    return <PostScreen postId={postId} showInFeed={true} />;
}
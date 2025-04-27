import axios from 'axios';
import { API_URL } from '@/context/AuthContext';

export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
    };
    title?: string;
    content: string;
    group?: {
        id: string;
        name: string;
    };
    likes: number;
    comments: number;
    createdAt: string;
}

// function for fetching current user's posts for profile
export const fetchMyPosts = async (token: string, page: number=1, limit: number=10): Promise<Post[]> => {
    try {
        const response = await axios.get(`${API_URL}/posts/my?token=${token}&page=${page}&limit=${limit}`);
        
        if (response.data.status === 'ok' && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching posts: ', error);
        return [];
    }
}
import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
    const { authState } = useAuth();
    
    return {
        isAuthenticated: () => !!authState?.authenticated,
        isSuperuser: () => authState?.user?.role === 'superuser',
        canDeleteContent: (authorId: string) => 
            authState?.user?.role === 'superuser' || 
            authState?.user?.id === authorId,
        };
};
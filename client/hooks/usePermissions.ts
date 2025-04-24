import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
    const { authState } = useAuth();
    
    return {
        isSuperuser: () => authState?.role === 'superuser',
        
        can: (action: string) => {
            if (!authState?.authenticated) return false;
            
            switch(action) {
                case 'create_group':
                case 'edit_group':
                case 'update_group_image':
                    return authState.role === 'superuser';
                default:
                    return false;
            }
        }
    };
};
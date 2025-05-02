export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    profileImage?: string;
    role?: 'user' | 'superuser';
}
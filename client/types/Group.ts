export interface Group {
    id: string;
    name: string;
    membersCount: number;
    groupImage: string;
    description: string;
    members?: {
        _id: string;
        firstName: string;
        lastName: string;
        preferredName?: string;
        profileImage?: string;
    }[];
}
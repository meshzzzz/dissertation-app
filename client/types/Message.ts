export interface Message {
    _id: string;
    groupId: string;
    senderId: {
        _id: string;
        firstName: string;
        lastName: string;
        preferredName?: string;
        profileImage?: string;
    };
    text: string;
    attachments: string[];
    createdAt: string;
}
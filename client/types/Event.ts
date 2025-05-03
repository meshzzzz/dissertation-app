export interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    group: {
        _id: string;
        name: string;
    };
    groupId?: string;
    groupName?: string;
    eventImage: string;
    interestedUsers: string[];
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
        preferredName?: string;
    };
    createdAt: string;
  }
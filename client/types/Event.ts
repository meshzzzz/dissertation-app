import { User } from "./User";

export interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    group: {
        _id: string;
        name: string;
    };
    eventImage: string;
    interestedUsers?: User[],
    userInterested: boolean;
    createdBy: User;
    createdAt: string;
  }
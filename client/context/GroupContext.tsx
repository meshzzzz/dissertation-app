import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Group } from '@/types/Group';
import { API_URL, useAuth } from '@/context/AuthContext';

interface LoadingState {
    all: boolean;
    userGroups: boolean;
    groups: Record<string, boolean>;
}

interface ErrorState {
    all: string | null;
    userGroups: string | null;
    groups: Record<string, string | null>;
}

interface GroupsContextType {
    groupsById: Record<string, Group>;
    allGroups: string[];
    myGroups: string[];
    loading: LoadingState;
    errors: ErrorState;
    fetchAllGroups: () => Promise<void>;
    fetchUserGroups: () => Promise<void>;
    fetchGroup: (groupId: string) => Promise<Group | null>;
    joinGroup: (groupId: string) => Promise<boolean>;
    leaveGroup: (groupId: string) => Promise<boolean>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();

    // Group data state
    const [groupsById, setGroupsById] = useState<Record<string, Group>>({});
    const [allGroups, setAllGroups] = useState<string[]>([]);
    const [myGroups, setMyGroups] = useState<string[]>([]);

    // Loading and error states
    const [loading, setLoading] = useState<LoadingState>({
        all: false,
        userGroups: false,
        groups: {}
    });

    const [errors, setErrors] = useState<ErrorState>({
        all: null,
        userGroups: null,
        groups: {}
    });

    // Helper to add groups to cache
    const addGroupsToCache = (groups: Group[]) => {
        const newGroups: Record<string, Group> = {};
        groups.forEach(group => {
            newGroups[group.id] = group;
        });

        setGroupsById(prev => ({
            ...prev,
            ...newGroups
        }));
    };

    // Fetch all groups
    const fetchAllGroups = async () => {
        if (!authState?.token) return;

        try {
            setLoading(prev => ({ ...prev, all: true }));
            setErrors(prev => ({ ...prev, all: null }));

            const response = await axios.get(`${API_URL}/groups`);

            if (response.data.status === 'ok') {
                const groups = response.data.data;
                
                // Store groups in cache
                addGroupsToCache(groups);
                
                // Store group IDs
                setAllGroups(groups.map((group: Group) => group.id));
            } else {
                setErrors(prev => ({ ...prev, all: 'Failed to fetch groups' }));
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
            setErrors(prev => ({ ...prev, all: 'Network error while fetching groups' }));
        } finally {
            setLoading(prev => ({ ...prev, all: false }));
        }
    };

    // Fetch user's groups
    const fetchUserGroups = async () => {
        if (!authState?.token) return;

        try {
            setLoading(prev => ({ ...prev, userGroups: true }));
            setErrors(prev => ({ ...prev, userGroups: null }));

            const response = await axios.post(`${API_URL}/user/groups`, { 
                token: authState.token 
            });

            if (response.data.status === 'ok') {
                const groups = response.data.data;
                
                // Store groups in cache
                addGroupsToCache(groups);
                
                // Store group IDs
                setMyGroups(groups.map((group: Group) => group.id));
            } else {
                setErrors(prev => ({ ...prev, userGroups: 'Failed to fetch your groups' }));
            }
        } catch (err) {
            console.error('Error fetching user groups:', err);
            setErrors(prev => ({ ...prev, userGroups: 'Network error while fetching your groups' }));
        } finally {
            setLoading(prev => ({ ...prev, userGroups: false }));
        }
    };

    // Fetch a single group
    const fetchGroup = async (groupId: string): Promise<Group | null> => {
        if (!authState?.token) return null;

        // If group already in cache and not stale, return it
        if (groupsById[groupId]) {
            return groupsById[groupId];
        }

        try {
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: true } 
            }));
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: null } 
            }));

            const response = await axios.get(`${API_URL}/groups/${groupId}`);

            if (response.data.status === 'ok') {
                const group = response.data.data;
                
                // Add to cache
                addGroupsToCache([group]);
                
                return group;
            } else {
                setErrors(prev => ({ 
                    ...prev, 
                    groups: { ...prev.groups, [groupId]: 'Failed to fetch group' } 
                }));
            }
        } catch (err) {
            console.error(`Error fetching group ${groupId}:`, err);
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: 'Network error while fetching group' } 
            }));
        } finally {
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: false } 
            }));
        }

        return null;
    };

    // Join a group
    const joinGroup = async (groupId: string): Promise<boolean> => {
        if (!authState?.token) return false;

        try {
            const response = await axios.post(`${API_URL}/groups/join`, {
                token: authState.token,
                groupId
            });

            if (response.data.status === 'ok') {
                // Add to my groups
                if (!myGroups.includes(groupId)) {
                    setMyGroups(prev => [...prev, groupId]);
                }

                // Update the group in cache if it exists
                if (groupsById[groupId]) {
                    setGroupsById(prev => ({
                        ...prev,
                        [groupId]: {
                            ...prev[groupId],
                            membersCount: prev[groupId].membersCount + 1
                        }
                    }));
                }

                return true;
            }
        } catch (err) {
            console.error(`Error joining group ${groupId}:`, err);
        }

        return false;
    };

    // Leave a group
    const leaveGroup = async (groupId: string): Promise<boolean> => {
        if (!authState?.token) return false;

        try {
            const response = await axios.post(`${API_URL}/groups/leave`, {
                token: authState.token,
                groupId
            });

            if (response.data.status === 'ok') {
                // Remove from my groups
                setMyGroups(prev => prev.filter(id => id !== groupId));

                // Update the group in cache if it exists
                if (groupsById[groupId]) {
                    setGroupsById(prev => ({
                        ...prev,
                        [groupId]: {
                            ...prev[groupId],
                            membersCount: Math.max(0, prev[groupId].membersCount - 1)
                        }
                    }));
                }

                return true;
            }
        } catch (err) {
            console.error(`Error leaving group ${groupId}:`, err);
        }

        return false;
    };

    // Reset state when auth changes
    useEffect(() => {
        setGroupsById({});
        setAllGroups([]);
        setMyGroups([]);
    }, [authState?.token]);

    const value = {
        groupsById,
        allGroups,
        myGroups,
        loading,
        errors,
        fetchAllGroups,
        fetchUserGroups,
        fetchGroup,
        joinGroup,
        leaveGroup
    };

    return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
};

export const useGroups = () => {
    const context = useContext(GroupsContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupsProvider');
    }
    return context;
};
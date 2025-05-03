import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/context/AuthContext';
import { Event } from '@/types/Event';

interface EventContextProps {
    eventsById: Record<string, Event>;
    userEvents: string[];
    groupEvents: Record<string, string[]>;
    loading: {
    user: boolean;
    groups: Record<string, boolean>;
    events: Record<string, boolean>;
    };
    errors: {
    user: string | null;
    groups: Record<string, string | null>;
    events: Record<string, string | null>;
    };
    fetchUserEvents: () => Promise<void>;
    fetchGroupEvents: (groupId: string) => Promise<void>;
    fetchEventDetails: (eventId: string) => Promise<Event | null>;
    toggleInterest: (eventId: string) => Promise<boolean>;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
    // state for events data
    const [eventsById, setEventsById] = useState<Record<string, Event>>({});
    const [userEvents, setUserEvents] = useState<string[]>([]);
    const [groupEvents, setGroupEvents] = useState<Record<string, string[]>>({});

    // loading states
    const [loading, setLoading] = useState({
    user: false,
    groups: {} as Record<string, boolean>,
    events: {} as Record<string, boolean>
    });

    // error states
    const [errors, setErrors] = useState({
    user: null as string | null,
    groups: {} as Record<string, string | null>,
    events: {} as Record<string, string | null>
    });

    // helper to add events to cache
    const addEventsToCache = (events: Event[]) => {
        const newEvents: Record<string, Event> = {};
        events.forEach(event => {
            newEvents[event._id] = event;
        });

        setEventsById(prev => ({
            ...prev,
            ...newEvents
        }));
    };

    // fetch events from user's groups
    const fetchUserEvents = async () => {
        try {
            setLoading(prev => ({ ...prev, user: true }));
            setErrors(prev => ({ ...prev, user: null }));

            const response = await axios.get(`${API_URL}/user/events`);

            if (response.data.status === 'ok') {
                const events = response.data.data;
                
                // store events in cache
                addEventsToCache(events);
                
                // set user events
                setUserEvents(events.map((event: Event) => event._id));
            } else {
                setErrors(prev => ({ ...prev, user: 'Failed to fetch events' }));
            }
        } catch (err) {
            console.error('Error fetching user events:', err);
            setErrors(prev => ({ ...prev, user: 'Network error while fetching events' }));
        } finally {
            setLoading(prev => ({ ...prev, user: false }));
        }
    };

    // fetch events for a specific group
    const fetchGroupEvents = async (groupId: string) => {
        try {
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: true } 
            }));
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: null } 
            }));

            const response = await axios.get(`${API_URL}/groups/${groupId}/events`);

            if (response.data.status === 'ok') {
                const events = response.data.data;
                
                // store events in cache
                addEventsToCache(events);
                
                // set group events
                setGroupEvents(prev => ({
                    ...prev,
                    [groupId]: events.map((event: Event) => event._id)
                }));
            } else {
                setErrors(prev => ({ 
                    ...prev, 
                    groups: { ...prev.groups, [groupId]: 'Failed to fetch group events' } 
                }));
            }
        } catch (err) {
            console.error(`Error fetching events for group ${groupId}:`, err);
            setErrors(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: 'Network error while fetching events' } 
            }));
        } finally {
            setLoading(prev => ({ 
                ...prev, 
                groups: { ...prev.groups, [groupId]: false } 
            }));
        }
    };

    // fetch details for a specific event
    const fetchEventDetails = async (eventId: string): Promise<Event | null> => {
        // if event already in cache return it
        if (eventsById[eventId] && eventsById[eventId].createdBy) {
            return eventsById[eventId];
        }

        try {
            setLoading(prev => ({ 
                ...prev, 
                events: { ...prev.events, [eventId]: true } 
            }));
            setErrors(prev => ({ 
                ...prev, 
                events: { ...prev.events, [eventId]: null } 
            }));

            const response = await axios.get(`${API_URL}/events/${eventId}`);

            if (response.data.status === 'ok') {
                const event = response.data.data;
                
                // add to cache
                setEventsById(prev => ({
                    ...prev,
                    [eventId]: event
                }));
                
                return event;
            } else {
            setErrors(prev => ({ 
                ...prev, 
                events: { ...prev.events, [eventId]: 'Failed to fetch event details' } 
            }));
            }
        } catch (err) {
            console.error(`Error fetching event ${eventId}:`, err);
            setErrors(prev => ({ 
                ...prev, 
                events: { ...prev.events, [eventId]: 'Network error while fetching event' } 
            }));
        } finally {
            setLoading(prev => ({ 
                ...prev, 
                events: { ...prev.events, [eventId]: false } 
            }));
        }

        return null;
    };

    // toggle interest in an event
    const toggleInterest = async (eventId: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${API_URL}/events/${eventId}/interest`);

            if (response.data.status === 'ok') {
                const result = response.data.data;
                const isInterested = result.interested;
                
                // update event in cache
                setEventsById(prev => {
                    const event = prev[eventId];
                    if (!event) return prev;
                    
                    return {
                    ...prev,
                        [eventId]: {
                            ...event,
                            interestedUsers: isInterested 
                            ? [...event.interestedUsers, result.userId] 
                            : event.interestedUsers.filter(id => id !== result.userId)
                        }
                    };
                });
                
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error toggling interest for event ${eventId}:`, err);
            return false;
        }
    };

    const value = {
        eventsById,
        userEvents,
        groupEvents,
        loading,
        errors,
        fetchUserEvents,
        fetchGroupEvents,
        fetchEventDetails,
        toggleInterest
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};
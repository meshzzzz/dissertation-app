import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_URL, useAuth } from '@/context/AuthContext';
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
    getUpcomingEvent: (groupId: string) => Event | null;
    toggleInterest: (eventId: string) => Promise<boolean>;
    deleteEvent: (eventId: string) => Promise<boolean>;
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
    const { authState } = useAuth();
    
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

    const updateEventInState = (eventId: string, updatedEvent: Partial<Event>) => {
        setEventsById(prev => {
            const event = prev[eventId];
            if (!event) return prev;
            
            return {
                ...prev,
                [eventId]: {
                    ...event,
                    ...updatedEvent
                }
            };
        });
    };

    // fetch events from user's groups
    const fetchUserEvents = async () => {
        if (!authState?.token) return;
        try {
            setLoading(prev => ({ ...prev, user: true }));
            setErrors(prev => ({ ...prev, user: null }));

            const response = await axios.get(`${API_URL}/user/events`, {
                params: { token: authState.token }
            });

            if (response.data.status === 'ok') {
                const events = response.data.data;

                const newEvents: Record<string, Event> = {};
                events.forEach((event: Event) => {
                    newEvents[event._id] = event;
                });

                setEventsById(prev => ({ ...prev, ...newEvents }));
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
        if (!authState?.token) return;
        try {
            setLoading(prev => ({ ...prev, groups: { ...prev.groups, [groupId]: true } }));
            setErrors(prev => ({ ...prev, groups: { ...prev.groups, [groupId]: null } }));

            const response = await axios.get(`${API_URL}/groups/${groupId}/events`, {
                params: { token: authState.token }
            });
            
            if (response.data.status === 'ok') {
                const events = response.data.data;
                const newEvents: Record<string, Event> = {};
                events.forEach((event: Event) => {
                    newEvents[event._id] = event;
                });

                setEventsById(prev => ({ ...prev, ...newEvents }));
                setGroupEvents(prev => ({...prev,[groupId]: events.map((event: Event) => event._id)}));
            } else {
                setErrors(prev => ({ ...prev, groups: { ...prev.groups, [groupId]: 'Failed to fetch group events' }}));
            }
        } catch (err) {
            console.error(`Error fetching events for group ${groupId}:`, err);
            setErrors(prev => ({ ...prev, groups: { ...prev.groups, [groupId]: 'Network error while fetching events' } }));
        } finally {
            setLoading(prev => ({ ...prev, groups: { ...prev.groups, [groupId]: false } }));
        }
    };

    // fetch details for a specific event
    const fetchEventDetails = async (eventId: string): Promise<Event | null> => {
        if (!authState?.token) return null;

        try {
            setLoading(prev => ({ ...prev, events: { ...prev.events, [eventId]: true } }));
            setErrors(prev => ({ ...prev, events: { ...prev.events, [eventId]: null } }));

            const response = await axios.get(`${API_URL}/events/${eventId}`, {
                params: { token: authState.token }
            });

            if (response.data.status === 'ok') {
                const event = response.data.data;

                setEventsById(prev => ({
                    ...prev,
                    [event._id]: event
                }));                
                
                return event;
            } else {
                setErrors(prev => ({ ...prev, events: { ...prev.events, [eventId]: 'Failed to fetch event details' }}));
            }
        } catch (err) {
            console.error(`Error fetching event ${eventId}:`, err);
            setErrors(prev => ({ ...prev, events: { ...prev.events, [eventId]: 'Network error while fetching event' } }));
        } finally {
            setLoading(prev => ({ ...prev, events: { ...prev.events, [eventId]: false }}));
        }

        return null;
    };

     // get upcoming event for group pinboard
     const getUpcomingEvent = (groupId: string): Event | null => {
        const eventIds = groupEvents[groupId] || [];
        if (eventIds.length === 0) return null;
        
        const events = eventIds
            .map(id => eventsById[id])
            .filter(Boolean);
            
        const currentDate = new Date();
        const upcomingEvents = events
            .filter(event => new Date(event.date) > currentDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
    };

    // toggle interest in an event
    const toggleInterest = async (eventId: string): Promise<boolean> => {
        if (!authState?.token) return false;
        try {
            const response = await axios.post(`${API_URL}/events/${eventId}/interest`)
    
            if (response.data.status === 'ok') {
                const event = response.data.data;
                updateEventInState(eventId, {
                    userInterested: event.interested,
                    interestedUsers: event.interestedUsers
                });
    
                return true;
            }
    
            return false;
        } catch (err) {
            console.error(`Error toggling interest for event ${eventId}:`, err);
            return false;
        }
    };
    

    // delete an event
    const deleteEvent = async (eventId: string): Promise<boolean> => {
        if (!authState?.token) return false;
        try {
            const response = await axios.delete(`${API_URL}/events/${eventId}`)

            if (response.data.status === 'ok') {
                setEventsById(prev => {
                    const newState = { ...prev };
                    delete newState[eventId];
                    return newState;
                });

                // remove from user/group events
                setUserEvents(prev => prev.filter(id => id !== eventId));
                setGroupEvents(prev => {
                    const newGroupEvents = { ...prev };
                    Object.keys(newGroupEvents).forEach(groupId => {
                        if (newGroupEvents[groupId].includes(eventId)) {
                            newGroupEvents[groupId] = newGroupEvents[groupId].filter(id => id !== eventId);
                        }
                    });
                    return newGroupEvents;
                });
                
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error deleting event ${eventId}:`, err);
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
        getUpcomingEvent,
        toggleInterest,
        deleteEvent
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};
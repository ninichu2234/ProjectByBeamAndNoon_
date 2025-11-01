"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null); 
    const [userId, setUserId] = useState(null);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                setSession(session);
                setUserId(session.user.id);
                setGuestId(null);
                
                // ดึงข้อมูล profile มาเก็บไว้
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(userProfile || null);
            } else {
                setSession(null);
                setUserId(null);
                setProfile(null);
                
                let currentGuestId = localStorage.getItem('guestUserId');
                if (!currentGuestId) {
                    currentGuestId = uuidv4();
                    localStorage.setItem('guestUserId', currentGuestId);
                }
                setGuestId(currentGuestId);
            }
            setLoading(false);
        };
        
        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                
                if (session) {
                    setSession(session);
                    setUserId(session.user.id);
                    setGuestId(null);
                    localStorage.removeItem('guestUserId'); // ลบ guestId เก่าทิ้ง
                    
                    // ดึง Profile
                    const { data: userProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(userProfile || null);
                
                } else {
                    setSession(null);
                    setUserId(null);
                    setProfile(null);
                    
                    // สร้าง guestId
                    let currentGuestId = uuidv4();
                    localStorage.setItem('guestUserId', currentGuestId);
                    setGuestId(currentGuestId);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const value = { session, userId, guestId, profile, loading };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context; 
};
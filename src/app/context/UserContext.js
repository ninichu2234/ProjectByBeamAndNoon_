"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Library สำหรับสร้าง UUID

// สร้าง Context
const UserContext = createContext(null);

// สร้าง Provider Component
export const UserProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [userId, setUserId] = useState(null);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // --- 1. ตรวจสอบ Session การล็อกอิน ---
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUserId(session?.user?.id ?? null);
            console.log("UserProvider: Initial session check:", session);

            // --- 2. จัดการ Guest ID (ถ้ายังไม่ล็อกอิน) ---
            if (!session) {
                let currentGuestId = localStorage.getItem('guestUserId');
                if (!currentGuestId) {
                    currentGuestId = uuidv4(); // สร้าง ID ใหม่
                    localStorage.setItem('guestUserId', currentGuestId);
                    console.log("UserProvider: Generated new guestId:", currentGuestId);
                } else {
                    console.log("UserProvider: Found existing guestId:", currentGuestId);
                }
                setGuestId(currentGuestId);
            } else {
                 // ถ้าล็อกอินแล้ว ไม่ต้องมี guestId
                 setGuestId(null);
                 // (อาจจะลบ guestUserId ออกจาก localStorage ด้วยก็ได้)
                 // localStorage.removeItem('guestUserId');
            }
            setLoading(false); // โหลดเสร็จหลังเช็ค session และ guestId
        });

        // --- 3. ฟังการเปลี่ยนแปลงสถานะ Auth ---
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log("UserProvider: Auth state changed:", session);
                setSession(session);
                setUserId(session?.user?.id ?? null);
                setLoading(false); // โหลดเสร็จ (เผื่อกรณีกลับมาจากหน้าล็อกอิน)

                // อัปเดต Guest ID อีกครั้งหลัง Auth เปลี่ยน
                if (!session) {
                    let currentGuestId = localStorage.getItem('guestUserId');
                    if (!currentGuestId) {
                        currentGuestId = uuidv4();
                        localStorage.setItem('guestUserId', currentGuestId);
                        console.log("UserProvider (Auth Change): Generated new guestId:", currentGuestId);
                    } else {
                         console.log("UserProvider (Auth Change): Using existing guestId:", currentGuestId);
                    }
                    setGuestId(currentGuestId);
                } else {
                    setGuestId(null); // ล็อกอินแล้ว ไม่มี guestId
                    // localStorage.removeItem('guestUserId');
                }
            }
        );

        // Cleanup listener
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const value = { session, userId, guestId, loading };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

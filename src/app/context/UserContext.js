"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ‼️ 1. กำหนดค่าเริ่มต้นเป็น Object เสมอ ‼️
const initialUserState = {
    session: null,
    userId: null,
    guestId: null,
    loading: true, // เริ่มต้น loading เป็น true
};

// สร้าง Context พร้อมค่าเริ่มต้น
const UserContext = createContext(initialUserState);

// สร้าง Provider Component
export const UserProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [userId, setUserId] = useState(null);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true); // เริ่มต้น loading เป็น true

    useEffect(() => {
        // --- 1. ตรวจสอบ Session การล็อกอิน ---
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUserId(session?.user?.id ?? null);
            console.log("UserProvider: Initial session check:", session);

            // --- 2. จัดการ Guest ID (ถ้ายังไม่ล็อกอิน) ---
            if (!session && typeof window !== 'undefined') { // ‼️ เพิ่ม check typeof window ‼️
                let currentGuestId = localStorage.getItem('guestUserId');
                if (!currentGuestId) {
                    currentGuestId = uuidv4();
                    localStorage.setItem('guestUserId', currentGuestId);
                    console.log("UserProvider: Generated new guestId:", currentGuestId);
                } else {
                    console.log("UserProvider: Found existing guestId:", currentGuestId);
                }
                setGuestId(currentGuestId);
            } else {
                 setGuestId(null);
                 // if (typeof window !== 'undefined') localStorage.removeItem('guestUserId');
            }
            setLoading(false); // โหลดเสร็จหลังเช็ค session และ guestId
            console.log("UserProvider: Initial loading complete."); // Log เพิ่ม
        }).catch(error => { // ‼️ เพิ่ม .catch() ‼️
            console.error("UserProvider: Error fetching initial session:", error);
            setLoading(false); // หยุด loading ถ้ามี error
             if (typeof window !== 'undefined') { // ยังคงพยายามโหลด guestId ถ้า getSession พลาด
                let currentGuestId = localStorage.getItem('guestUserId');
                 if (!currentGuestId) {
                     currentGuestId = uuidv4();
                     localStorage.setItem('guestUserId', currentGuestId);
                 }
                 setGuestId(currentGuestId);
             }
        });

        // --- 3. ฟังการเปลี่ยนแปลงสถานะ Auth ---
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log("UserProvider: Auth state changed:", session);
                setSession(session);
                setUserId(session?.user?.id ?? null);
                // ไม่ต้อง setLoading(true) ตอน Auth เปลี่ยน เพราะอาจทำให้หน้ากระพริบ
                // setLoading(true);

                if (!session && typeof window !== 'undefined') { // ‼️ เพิ่ม check typeof window ‼️
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
                    setGuestId(null);
                    // if (typeof window !== 'undefined') localStorage.removeItem('guestUserId');
                }
                 // Set loading false หลังจากจัดการ auth state change เสร็จ
                 setLoading(false);
                 console.log("UserProvider: Auth change handling complete."); // Log เพิ่ม
            }
        );

        // Cleanup listener
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // ‼️ 2. ตรวจสอบให้แน่ใจว่า value เป็น Object เสมอ ‼️
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
    // ‼️ เอา check undefined ออก เพราะเรามีค่าเริ่มต้นแล้ว ‼️
    // if (context === undefined) {
    //     throw new Error('useUser must be used within a UserProvider');
    // }
    // คืนค่า context ที่มีโครงสร้าง object เสมอ
    return context || initialUserState; // ถ้า context เป็น null (ไม่ควรเกิด) ให้คืนค่าเริ่มต้น
};


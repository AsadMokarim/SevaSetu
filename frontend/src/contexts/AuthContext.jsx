import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getMe, logout as apiLogout } from '../api/authApi';
import { logout as firebaseLogout } from '../services/authService';
import { unregisterPushToken } from '../services/fcmClientService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Force token refresh to ensure it's valid
                    await firebaseUser.getIdToken(true);
                    // Fetch user profile from our backend (which verifies token & auto-creates if missing)
                    const backendUser = await getMe();
                    
                    if (backendUser) {
                        setUser({
                            ...firebaseUser,
                            ...backendUser
                        });
                    } else {
                        // Backend failed to fetch user
                        setUser(firebaseUser);
                    }
                } catch (error) {
                    console.error("Error fetching backend user profile:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await unregisterPushToken().catch(() => {}); // Phase 2: Clear push token first
            await firebaseLogout();
            await apiLogout().catch(() => {}); // Backend cleanup if needed
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        loading,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVolunteer: user?.role === 'volunteer',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

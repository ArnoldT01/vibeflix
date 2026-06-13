import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);
    const [authModal, setAuthModal] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
        return () => subscription.unsubscribe();
    }, []);

    const signUp = (email, password) =>
        supabase.auth.signUp({ email, password });

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signOut = () => supabase.auth.signOut();

    const requireAuth = (callback) => {
        if (session) {
            callback();
        } else {
            setAuthModal(true);
        }
    };

    return (
        <AuthContext.Provider value={{ session, authModal, setAuthModal, signUp, signIn, signOut, requireAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useHistory = () => {
    const { session } = useAuth();

    const record = useCallback(async (mediaType, mediaId, details) => {
        if (!session) return;
        await supabase.from('history').upsert({
            user_id: session.user.id,
            media_type: mediaType,
            media_id: String(mediaId),
            title: details.title || details.name || '',
            poster_path: details.poster_path || null,
            watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,media_type,media_id' });
    }, [session]);

    return { record };
};

export const useHistoryItems = () => {
    const { session } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async () => {
        if (!session) { setItems([]); return; }
        setLoading(true);
        const { data } = await supabase
            .from('history')
            .select('*')
            .eq('user_id', session.user.id)
            .order('watched_at', { ascending: false });
        setItems(data || []);
        setLoading(false);
    }, [session]);

    useEffect(() => { fetch(); }, [fetch]);

    const remove = async (id) => {
        await supabase.from('history').delete().eq('id', id);
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    return { items, loading, remove, refetch: fetch };
};

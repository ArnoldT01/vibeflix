import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useWatchlist = (mediaType, mediaId) => {
    const { session } = useAuth();
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!session || !mediaId) { setInWatchlist(false); return; }
        supabase
            .from('watchlist')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('media_type', mediaType)
            .eq('media_id', String(mediaId))
            .maybeSingle()
            .then(({ data }) => setInWatchlist(!!data));
    }, [session, mediaType, mediaId]);

    const toggle = useCallback(async (details) => {
        if (!session) return;
        setLoading(true);
        if (inWatchlist) {
            await supabase
                .from('watchlist')
                .delete()
                .eq('user_id', session.user.id)
                .eq('media_type', mediaType)
                .eq('media_id', String(mediaId));
            setInWatchlist(false);
        } else {
            await supabase.from('watchlist').insert({
                user_id: session.user.id,
                media_type: mediaType,
                media_id: String(mediaId),
                title: details.title || details.name || '',
                poster_path: details.poster_path || null,
            });
            setInWatchlist(true);
        }
        setLoading(false);
    }, [session, inWatchlist, mediaType, mediaId]);

    return { inWatchlist, toggle, loading };
};

export const useWatchlistItems = () => {
    const { session } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async () => {
        if (!session) { setItems([]); return; }
        setLoading(true);
        const { data } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
        setItems(data || []);
        setLoading(false);
    }, [session]);

    useEffect(() => { fetch(); }, [fetch]);

    const remove = async (id) => {
        await supabase.from('watchlist').delete().eq('id', id);
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    return { items, loading, remove, refetch: fetch };
};

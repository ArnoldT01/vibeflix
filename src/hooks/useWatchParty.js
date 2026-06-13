import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function randomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const createWatchRoom = async (session, mediaType, mediaId, details, season = 1, episode = 1) => {
    const roomCode = randomCode();
    const { data, error } = await supabase.from('watch_rooms').insert({
        room_code: roomCode,
        host_id: session.user.id,
        host_name: session.user.email.split('@')[0],
        media_type: mediaType,
        media_id: String(mediaId),
        title: details.title || details.name || '',
        poster_path: details.poster_path || null,
        season,
        episode,
        is_started: false,
    }).select().single();
    if (error) throw error;
    return data;
};

export const useWatchParty = (roomCode) => {
    const { session } = useAuth();
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [playerStarted, setPlayerStarted] = useState(false);
    const [currentEp, setCurrentEp] = useState({ season: 1, episode: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const channelRef = useRef(null);

    const isHost = !!(room && session && room.host_id === session.user.id);
    const displayName = session?.user.email.split('@')[0] ?? 'Guest';

    // Load room
    useEffect(() => {
        if (!session || !roomCode) return;
        supabase
            .from('watch_rooms')
            .select('*')
            .eq('room_code', roomCode)
            .single()
            .then(({ data, error: err }) => {
                if (err || !data) { setError('Room not found.'); setLoading(false); return; }
                setRoom(data);
                setCurrentEp({ season: data.season, episode: data.episode });
                if (data.is_started) setPlayerStarted(true);
                setLoading(false);
            });
    }, [session, roomCode]);

    // Realtime channel
    useEffect(() => {
        if (!session || !room) return;

        const channel = supabase.channel(`room:${room.id}`, {
            config: { broadcast: { self: false }, presence: { key: session.user.id } },
        });
        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setParticipants(Object.values(state).flat());
            })
            .on('broadcast', { event: 'start' }, () => setPlayerStarted(true))
            .on('broadcast', { event: 'episode' }, ({ payload }) =>
                setCurrentEp({ season: payload.season, episode: payload.episode }))
            .on('broadcast', { event: 'chat' }, ({ payload }) =>
                setMessages((prev) => [...prev, payload]))
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: session.user.id, display_name: displayName });
                }
            });

        // Load message history
        supabase
            .from('room_messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true })
            .then(({ data }) => setMessages(data || []));

        return () => { supabase.removeChannel(channel); };
    }, [session, room, displayName]);

    const startParty = useCallback(async () => {
        if (!isHost || !room) return;
        await supabase.from('watch_rooms').update({ is_started: true }).eq('id', room.id);
        channelRef.current?.send({ type: 'broadcast', event: 'start', payload: {} });
        setPlayerStarted(true);
    }, [isHost, room]);

    const changeEpisode = useCallback(async (season, episode) => {
        if (!isHost || !room) return;
        await supabase.from('watch_rooms').update({ season, episode }).eq('id', room.id);
        channelRef.current?.send({ type: 'broadcast', event: 'episode', payload: { season, episode } });
        setCurrentEp({ season, episode });
    }, [isHost, room]);

    const sendMessage = useCallback(async (content) => {
        if (!session || !room || !content.trim()) return;
        const msg = {
            room_id: room.id,
            user_id: session.user.id,
            display_name: displayName,
            content: content.trim(),
            created_at: new Date().toISOString(),
        };
        const { data } = await supabase.from('room_messages').insert(msg).select().single();
        const final = data || msg;
        channelRef.current?.send({ type: 'broadcast', event: 'chat', payload: final });
        setMessages((prev) => [...prev, final]);
    }, [session, room, displayName]);

    const leaveRoom = useCallback(async () => {
        if (isHost && room) {
            await supabase.from('watch_rooms').delete().eq('id', room.id);
        }
        if (channelRef.current) await supabase.removeChannel(channelRef.current);
    }, [isHost, room]);

    return {
        room, isHost, messages, participants,
        playerStarted, currentEp,
        loading, error,
        startParty, changeEpisode, sendMessage, leaveRoom,
    };
};

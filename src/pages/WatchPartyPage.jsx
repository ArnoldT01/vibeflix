import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchParty } from '../hooks/useWatchParty';
import WatchPartyChat from '../components/WatchPartyChat';
import '../styles/watchparty.css';

const EpControls = ({ currentEp, onChange }) => {
    const [s, setS] = useState(currentEp.season);
    const [e, setE] = useState(currentEp.episode);

    useEffect(() => { setS(currentEp.season); setE(currentEp.episode); }, [currentEp]);

    const apply = () => onChange(Number(s), Number(e));

    return (
        <div className="wp-ep-controls">
            <span className="wp-ep-label">Episode</span>
            <label>S<input className="wp-ep-input" type="number" min={1} value={s} onChange={(ev) => setS(ev.target.value)} /></label>
            <label>E<input className="wp-ep-input" type="number" min={1} value={e} onChange={(ev) => setE(ev.target.value)} /></label>
            <button className="wp-ep-btn" onClick={apply}>Go</button>
        </div>
    );
};

const WatchPartyPage = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { session, setAuthModal } = useAuth();
    const [copied, setCopied] = useState(false);
    const [wpError, setWpError] = useState(false);
    const [wpIframeKey, setWpIframeKey] = useState(0);

    const {
        room, isHost, messages, participants,
        playerStarted, currentEp,
        loading, error,
        startParty, changeEpisode, sendMessage, leaveRoom,
    } = useWatchParty(roomCode);

    useEffect(() => {
        if (session === null) {
            setAuthModal(true);
            navigate('/');
        }
    }, [session, navigate, setAuthModal]);

    const handleLeave = async () => {
        await leaveRoom();
        if (room) navigate(`/${room.media_type}/${room.media_id}`);
        else navigate('/');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (session === undefined || loading) {
        return (
            <div className="wp-fullscreen-center">
                <div className="page-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="wp-fullscreen-center">
                <p className="wp-error-msg">{error}</p>
                <button className="wp-leave-btn" onClick={() => navigate('/')}>Go Home</button>
            </div>
        );
    }

    const embedBase = import.meta.env.VITE_PLAYER_URL;
    const embedSrc = room.media_type === 'tv'
        ? `${embedBase}/tv/${room.media_id}/${currentEp.season}/${currentEp.episode}`
        : `${embedBase}/movie/${room.media_id}`;

    return (
        <div className="wp-page">
            {/* Header */}
            <div className="wp-header">
                <button className="wp-leave-btn" onClick={handleLeave}>← Leave</button>
                <span className="wp-header-title">{room.title}</span>
                <div className="wp-room-code">
                    <span className="wp-code-label">Room</span>
                    <span className="wp-code-value">{roomCode}</span>
                    <button className="wp-copy-btn" onClick={copyLink}>
                        {copied ? '✓ Copied' : 'Copy Link'}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="wp-body">
                {/* Player side */}
                <div className="wp-player-side">
                    <div className="wp-player-wrap">
                        {playerStarted ? (
                            wpError ? (
                                <div className="wp-player-error">
                                    <span className="wp-player-error-icon">⚠</span>
                                    <p className="wp-player-error-title">Video unavailable</p>
                                    <p className="wp-player-error-sub">The video source couldn't be loaded.</p>
                                    <button className="wp-player-error-btn" onClick={() => { setWpError(false); setWpIframeKey((k) => k + 1); }}>Try again</button>
                                </div>
                            ) : (
                                <iframe
                                    key={wpIframeKey}
                                    src={embedSrc}
                                    className="wp-player"
                                    title={room.title}
                                    allowFullScreen
                                    referrerPolicy="origin"
                                    onError={() => setWpError(true)}
                                />
                            )
                        ) : (
                            <div className="wp-waiting">
                                {room.poster_path && (
                                    <img
                                        className="wp-waiting-poster"
                                        src={`https://image.tmdb.org/t/p/w342${room.poster_path}`}
                                        alt={room.title}
                                    />
                                )}
                                <div className="wp-waiting-info">
                                    <p className="wp-waiting-title">{room.title}</p>
                                    {isHost ? (
                                        <button className="wp-start-btn" onClick={startParty}>
                                            ▶ Start for everyone
                                        </button>
                                    ) : (
                                        <p className="wp-waiting-msg">
                                            Waiting for <strong>{room.host_name}</strong> to start…
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {playerStarted && !wpError && (
                        <div className="player-trouble-row">
                            <button className="player-trouble-btn" onClick={() => { setWpError(false); setWpIframeKey((k) => k + 1); }}>
                                Video not loading? Retry
                            </button>
                        </div>
                    )}

                    {/* Host episode controls for TV */}
                    {isHost && room.media_type === 'tv' && (
                        <EpControls currentEp={currentEp} onChange={changeEpisode} />
                    )}

                    {/* Guest episode indicator for TV */}
                    {!isHost && room.media_type === 'tv' && playerStarted && (
                        <div className="wp-ep-indicator">
                            S{currentEp.season} · E{currentEp.episode}
                        </div>
                    )}
                </div>

                {/* Chat side */}
                <WatchPartyChat
                    messages={messages}
                    participants={participants}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
};

export default WatchPartyPage;

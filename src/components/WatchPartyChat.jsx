import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const WatchPartyChat = ({ messages, participants, onSend }) => {
    const { session } = useAuth();
    const [text, setText] = useState('');
    const bottomRef = useRef(null);
    const myId = session?.user.id;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    return (
        <div className="wp-chat">
            <div className="wp-chat-header">
                <span>Chat</span>
                <div className="wp-avatars">
                    {participants.slice(0, 5).map((p) => (
                        <div key={p.user_id} className="wp-avatar" title={p.display_name}>
                            {p.display_name[0].toUpperCase()}
                        </div>
                    ))}
                    {participants.length > 5 && (
                        <div className="wp-avatar wp-avatar--more">+{participants.length - 5}</div>
                    )}
                </div>
            </div>

            <div className="wp-messages">
                {messages.length === 0 && (
                    <p className="wp-messages-empty">No messages yet. Say hi!</p>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.user_id === myId;
                    return (
                        <div key={msg.id || i} className={`wp-msg${isMe ? ' wp-msg--me' : ''}`}>
                            {!isMe && <span className="wp-msg-name">{msg.display_name}</span>}
                            <span className="wp-msg-bubble">{msg.content}</span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="wp-chat-form">
                <input
                    className="wp-chat-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Say something…"
                    maxLength={300}
                />
                <button type="submit" className="wp-chat-send" disabled={!text.trim()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default WatchPartyChat;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWatchlistItems } from '../hooks/useWatchlist';
import { useHistoryItems } from '../hooks/useHistory';
import '../styles/auth.css';

const IMG = 'https://image.tmdb.org/t/p';

const MediaGrid = ({ items, loading, remove }) => {
    if (loading) return <p className="watchlist-empty">Loading…</p>;
    if (!items.length) return <p className="watchlist-empty">Nothing here yet.</p>;
    return (
        <div className="watchlist-grid">
            {items.map((item) => (
                <div key={item.id} className="watchlist-card">
                    <Link to={`/${item.media_type}/${item.media_id}`}>
                        {item.poster_path ? (
                            <img src={`${IMG}/w342${item.poster_path}`} alt={item.title} />
                        ) : (
                            <div className="watchlist-card-placeholder" />
                        )}
                    </Link>
                    <p className="watchlist-card-title">{item.title}</p>
                    <button className="watchlist-remove" onClick={() => remove(item.id)} aria-label="Remove">✕</button>
                </div>
            ))}
        </div>
    );
};

const WatchlistPage = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('watchlist');
    const watchlist = useWatchlistItems();
    const history = useHistoryItems();

    const active = tab === 'watchlist' ? watchlist : history;

    return (
        <div className="watchlist-page">
            <button className="watchlist-back" onClick={() => navigate('/')}>
                ← Back
            </button>
            <h1>My Library</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
                {['watchlist', 'history'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            background: tab === t ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${tab === t ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            color: tab === t ? '#c4b5fd' : 'rgba(255,255,255,0.6)',
                            borderRadius: '8px',
                            padding: '0.45rem 1.1rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <MediaGrid items={active.items} loading={active.loading} remove={active.remove} />
        </div>
    );
};

export default WatchlistPage;

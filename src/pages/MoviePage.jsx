import { useEffect, useState } from 'react';
import { useParams, useNavigate, useMatch, Link } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import { useHistory } from '../hooks/useHistory';
import { createWatchRoom } from '../hooks/useWatchParty';
import FranchiseSection from '../components/FranchiseSection';
import EpisodesSection from '../components/EpisodesSection';
import '../styles/detail.css';
import '../styles/auth.css';

const IMG = 'https://image.tmdb.org/t/p';

const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
};

const MoviePage = () => {
    const { id } = useParams();
    const tvMatch = useMatch('/tv/:id');
    const pathKind = tvMatch ? 'tv' : 'movie';
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [trailerOpen, setTrailerOpen] = useState(false);
    const [collection, setCollection] = useState(null);
    const [selectedEp, setSelectedEp] = useState(null);
    const [playerLoaded, setPlayerLoaded] = useState(false);
    const [cast, setCast] = useState([]);

    const { session, requireAuth } = useAuth();
    const { inWatchlist, toggle: toggleWatchlist, loading: wlLoading } = useWatchlist(pathKind, id);
    const { record: recordHistory } = useHistory();
    const [wpLoading, setWpLoading] = useState(false);

    useEffect(() => {
        if (!trailerOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') setTrailerOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [trailerOpen]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setDetails(null);
        setCollection(null);
        setSelectedEp(null);
        setTrailerOpen(false);
        setPlayerLoaded(false);
        setCast([]);

        const load = async () => {
            const res = await fetch(
                `${API_BASE_URL}/${pathKind}/${id}?append_to_response=videos,credits`,
                API_OPTIONS,
            );
            const data = await res.json();
            setDetails(data);
            setCast(data.credits?.cast || []);

            const trailer = data.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
            setTrailerKey(trailer?.key ?? null);

            if (pathKind === 'movie' && data.belongs_to_collection) {
                const colRes = await fetch(`${API_BASE_URL}/collection/${data.belongs_to_collection.id}`, API_OPTIONS);
                setCollection(await colRes.json());
            }
        };
        load();
    }, [id, pathKind]);

    if (!details) {
        return <div className="page-loading"><div className="page-spinner" /></div>;
    }

    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').split('-')[0];
    const runtimeMins = pathKind === 'tv' ? details.episode_run_time?.[0] : details.runtime;
    const runtime = formatRuntime(runtimeMins);
    const genres = details.genres?.map((g) => g.name).join(' • ') ?? '';
    const backdrop = details.backdrop_path ? `${IMG}/original${details.backdrop_path}` : null;
    const poster = details.poster_path ? `${IMG}/w500${details.poster_path}` : null;

    const embedBase = import.meta.env.VITE_PLAYER_URL;
    const embedSrc = pathKind === 'tv'
        ? selectedEp
            ? `${embedBase}/tv/${id}/${selectedEp.season}/${selectedEp.episode}`
            : `${embedBase}/tv/${id}/1/1`
        : `${embedBase}/movie/${id}`;

    const handleWatchParty = () => {
        requireAuth(async () => {
            setWpLoading(true);
            try {
                const season = selectedEp?.season ?? 1;
                const episode = selectedEp?.episode ?? 1;
                const room = await createWatchRoom(session, pathKind, id, details, season, episode);
                navigate(`/watch/${room.room_code}`);
            } finally {
                setWpLoading(false);
            }
        });
    };

    const handlePlayerLoad = () => {
        setPlayerLoaded(true);
        recordHistory(pathKind, id, details);
    };

    const handleEpisodeSelect = (ep) => {
        setSelectedEp(ep);
        setPlayerLoaded(true);
        recordHistory(pathKind, id, details);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="movie-page">
            {backdrop && (
                <div className="movie-page-bg" style={{ backgroundImage: `url(${backdrop})` }} />
            )}

            <button className="page-back-btn" onClick={() => navigate('/')} aria-label="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
            </button>

            {/* Player — always visible, click to load */}
            <div className="detail-player-banner">
                <div className="detail-player-wrap">
                    <div className="movie-page-player">
                        {playerLoaded ? (
                            <iframe src={embedSrc} title={title} allowFullScreen referrerPolicy="origin" />
                        ) : (
                            <button
                                className="player-placeholder"
                                style={backdrop ? { backgroundImage: `url(${backdrop})` } : {}}
                                onClick={handlePlayerLoad}
                                aria-label="Play"
                            >
                                <div className="player-placeholder-overlay" />
                                <span className="player-play-btn">▶</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details — poster + metadata */}
            <div className="detail-banner">
                <div className="detail-banner-inner">
                    {poster ? (
                        <img className="detail-poster" src={poster} alt={title} />
                    ) : (
                        <div className="detail-poster-placeholder" />
                    )}
                    <div className="detail-meta">
                        <h1 className="detail-title">{title}</h1>
                        <div className="detail-stats">
                            {details.vote_average > 0 && (
                                <span className="detail-rating">★ {details.vote_average.toFixed(1)}</span>
                            )}
                            {year && <span>{year}</span>}
                            {runtime && <span>{runtime}</span>}
                        </div>
                        {genres && <div className="detail-genres">{genres}</div>}
                        {details.overview && (
                            <p className="detail-overview">{details.overview}</p>
                        )}
                        <div className="detail-actions">
                            {trailerKey && (
                                <button className="page-btn page-btn--trailer" onClick={() => setTrailerOpen(true)}>
                                    Trailer
                                </button>
                            )}
                            <button
                                className={`watchlist-btn${inWatchlist ? ' watchlist-btn--active' : ''}`}
                                disabled={wlLoading}
                                onClick={() => requireAuth(() => toggleWatchlist(details))}
                            >
                                {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
                            </button>
                            <button
                                className="watchlist-btn"
                                disabled={wpLoading}
                                onClick={handleWatchParty}
                            >
                                {wpLoading ? '…' : '👥 Watch Party'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
                <div className="movie-page-section">
                    <h2 className="detail-section-title">Cast</h2>
                    <div className="cast-grid">
                        {cast.slice(0, 9).map((p) => (
                            <div className="cast-card" key={p.id}>
                                <div className="cast-photo">
                                    {p.profile_path ? (
                                        <img src={`${IMG}/w185${p.profile_path}`} alt={p.name} />
                                    ) : (
                                        <div className="cast-photo-placeholder" />
                                    )}
                                </div>
                                <p className="cast-name">{p.name}</p>
                                <p className="cast-character">{p.character}</p>
                            </div>
                        ))}
                    </div>
                    {cast.length > 9 && (
                        <Link className="cast-view-more" to={`/${pathKind}/${id}/cast`}>
                            View Full Cast ({cast.length})
                        </Link>
                    )}
                </div>
            )}

            {pathKind === 'movie' && (
                <FranchiseSection collection={collection} currentId={parseInt(id)} />
            )}

            {pathKind === 'tv' && (
                <EpisodesSection
                    id={id}
                    seasons={details.seasons}
                    selectedEp={selectedEp}
                    onEpisodeSelect={handleEpisodeSelect}
                />
            )}

            {trailerOpen && trailerKey && (
                <div className="trailer-backdrop" onClick={() => setTrailerOpen(false)}>
                    <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="trailer-close" onClick={() => setTrailerOpen(false)}>✕</button>
                        <div className="trailer-player">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                                title={`${title} trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoviePage;

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useMatch } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';
import FranchiseSection from '../components/FranchiseSection';
import EpisodesSection from '../components/EpisodesSection';
import '../styles/detail.css';

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

        const load = async () => {
            const res = await fetch(`${API_BASE_URL}/${pathKind}/${id}?append_to_response=videos`, API_OPTIONS);
            const data = await res.json();
            setDetails(data);

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
    const backdrop = details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : null;

    const embedBase = import.meta.env.VITE_PLAYER_URL;
    const embedSrc = pathKind === 'tv'
        ? selectedEp
            ? `${embedBase}/tv/${id}/${selectedEp.season}/${selectedEp.episode}?autoplay=false`
            : `${embedBase}/tv/${id}?autoplay=false`
        : `${embedBase}/movie/${id}?autoplay=false`;

    const handleEpisodeSelect = (ep) => {
        setSelectedEp(ep);
        setPlayerLoaded(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="movie-page">
            {/* Fixed background — stays in place as content scrolls */}
            {backdrop && (
                <div
                    className="movie-page-bg"
                    style={{ backgroundImage: `url(${backdrop})` }}
                />
            )}

            {/* Home button — fixed, always visible */}
            <button className="page-back-btn" onClick={() => navigate('/')} aria-label="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
            </button>

            {/* Hero — always for movies; for TV only once an episode is picked */}
            {(pathKind === 'movie' || playerLoaded) && (
                <div className="movie-page-hero">
                    <div className="movie-page-hero-overlay" />
                    <div className="movie-page-player-wrap">
                        <div className="movie-page-player">
                            {playerLoaded ? (
                                <iframe src={embedSrc} title={title} allowFullScreen referrerPolicy="origin" />
                            ) : (
                                <button
                                    className="player-placeholder"
                                    style={backdrop ? { backgroundImage: `url(${backdrop})` } : {}}
                                    onClick={() => setPlayerLoaded(true)}
                                    aria-label="Play"
                                >
                                    <div className="player-placeholder-overlay" />
                                    <span className="player-play-btn">▶</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Info — scrolls over the fixed background */}
            <div className={`movie-page-info${pathKind === 'tv' && !playerLoaded ? ' movie-page-info--top' : ''}`}>
                <h1 className="movie-page-title">{title}</h1>
                <div className="movie-page-tags">
                    {details.vote_average > 0 && <span>★ {details.vote_average.toFixed(1)}</span>}
                    {year && <span>{year}</span>}
                    {runtime && <span>{runtime}</span>}
                    {genres && <span>{genres}</span>}
                </div>
                {details.overview && (
                    <p className="movie-page-overview">{details.overview}</p>
                )}
                {trailerKey && (
                    <button
                        className="page-btn page-btn--trailer"
                        onClick={() => setTrailerOpen(true)}
                    >
                        Trailer
                    </button>
                )}
            </div>

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

            {/* Trailer modal */}
            {trailerOpen && trailerKey && (
                <div
                    className="trailer-backdrop"
                    onClick={() => setTrailerOpen(false)}
                >
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

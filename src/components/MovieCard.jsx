import { useState, useEffect } from "react";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
};

const MovieCard = ({ movie, onSelect }) => {
    const { id, title, vote_average, poster_path, release_date } = movie;
    const [runtime, setRuntime] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchDetails = async () => {
            try {
                const kind = movie.media_type === 'tv' ? 'tv' : 'movie';
                const res = await fetch(`${API_BASE_URL}/${kind}/${id}`, API_OPTIONS);
                const data = await res.json();
                if (!cancelled) {
                    const mins = kind === 'tv'
                        ? (data.episode_run_time?.[0] || null)
                        : (data.runtime || null);
                    setRuntime(mins);
                }
            } catch (e) {}
        };
        fetchDetails();
        return () => { cancelled = true; };
    }, [id, movie.media_type]);

    const year = release_date ? release_date.split('-')[0] : 'N/A';

    return (
        <div className="movie-card" onClick={() => onSelect(movie)}>
            <img
                src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `${import.meta.env.BASE_URL}/no-movie.png`}
                alt={title}
            />

            <div className="card-rating">
                <img src="star.svg" alt="Star" />
                <span>{vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
            </div>

            <div className="card-info">
                <h3>{title}</h3>
                <div className="card-meta">
                    <span>{year}</span>
                    {runtime && <span>{formatRuntime(runtime)}</span>}
                </div>
            </div>
        </div>
    );
};

export default MovieCard;

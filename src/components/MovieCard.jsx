import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const isCamRelease = (releaseDates) => {
    const today = new Date();
    const allDates = (releaseDates?.results ?? [])
        .flatMap((r) => r.release_dates)
        .filter((r) => r.type === 4 || r.type === 5);
    return !allDates.some((r) => r.release_date && new Date(r.release_date) <= today);
};

const MovieCard = ({ movie }) => {
    const { id, title, vote_average, poster_path, release_date } = movie;
    const kind = movie.media_type === 'tv' ? 'tv' : 'movie';
    const [runtime, setRuntime] = useState(null);
    const [isCam, setIsCam] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchDetails = async () => {
            try {
                const url = kind === 'movie'
                    ? `${API_BASE_URL}/movie/${id}?append_to_response=release_dates`
                    : `${API_BASE_URL}/tv/${id}`;
                const res = await fetch(url, API_OPTIONS);
                const data = await res.json();
                if (!cancelled) {
                    const mins = kind === 'tv'
                        ? (data.episode_run_time?.[0] || null)
                        : (data.runtime || null);
                    setRuntime(mins);
                    if (kind === 'movie') {
                        setIsCam(isCamRelease(data.release_dates));
                    }
                }
            } catch (e) {}
        };
        fetchDetails();
        return () => { cancelled = true; };
    }, [id, kind]);

    const year = release_date ? release_date.split('-')[0] : 'N/A';

    return (
        <Link to={`/${kind}/${id}`} className="movie-card">
            <div className="card-poster">
                <img
                    src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `${import.meta.env.BASE_URL}/no-movie.png`}
                    alt={title}
                />
                {isCam && <span className="card-cam-badge">CAM</span>}
            </div>

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
        </Link>
    );
};

export default MovieCard;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

const HeroSection = ({ mediaType = 'all' }) => {
    const [movies, setMovies] = useState([]);
    const [current, setCurrent] = useState(0);
    const [exiting, setExiting] = useState(null);
    const [direction, setDirection] = useState(1);
    const currentRef = useRef(0);
    const animatingRef = useRef(false);
    const dragStartX = useRef(null);
    const isDragging = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        const kind = mediaType === 'tv' ? 'tv' : mediaType === 'movie' ? 'movie' : 'all';
        fetch(`${API_BASE_URL}/trending/${kind}/week`, API_OPTIONS)
            .then(r => r.json())
            .then(data => {
                const results = (data.results || []).filter(m => m.backdrop_path).slice(0, 8);
                setMovies(results);
                setCurrent(0);
                setExiting(null);
                currentRef.current = 0;
                animatingRef.current = false;
            })
            .catch(() => {});
    }, [mediaType]);

    const changeTo = useCallback((idx, dir = 1) => {
        if (animatingRef.current || idx === currentRef.current) return;
        animatingRef.current = true;
        setExiting(currentRef.current);
        setDirection(dir);
        currentRef.current = idx;
        setCurrent(idx);
        setTimeout(() => {
            setExiting(null);
            animatingRef.current = false;
        }, 650);
    }, []);

    useEffect(() => {
        if (!movies.length) return;
        const id = setInterval(() => {
            changeTo((currentRef.current + 1) % movies.length, 1);
        }, 10000);
        return () => clearInterval(id);
    }, [movies.length, changeTo]);

    const onMouseDown = (e) => { dragStartX.current = e.clientX; isDragging.current = false; };
    const onMouseMove = (e) => {
        if (dragStartX.current === null) return;
        if (Math.abs(e.clientX - dragStartX.current) > 5) isDragging.current = true;
    };
    const onMouseUp = (e) => {
        if (dragStartX.current === null) return;
        const delta = dragStartX.current - e.clientX;
        dragStartX.current = null;
        if (!isDragging.current || Math.abs(delta) < 50) return;
        const idx = currentRef.current;
        if (delta > 0 && idx < movies.length - 1) changeTo(idx + 1, 1);
        else if (delta < 0 && idx > 0) changeTo(idx - 1, -1);
    };
    const onTouchStart = (e) => { dragStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (dragStartX.current === null) return;
        const delta = dragStartX.current - e.changedTouches[0].clientX;
        dragStartX.current = null;
        if (Math.abs(delta) < 50) return;
        const idx = currentRef.current;
        if (delta > 0 && idx < movies.length - 1) changeTo(idx + 1, 1);
        else if (delta < 0 && idx > 0) changeTo(idx - 1, -1);
    };

    if (!movies.length) return <div className="hero-section" />;

    return (
        <div
            className="hero-section"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { dragStartX.current = null; }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {movies.map((m, i) => {
                if (i !== current && i !== exiting) return null;
                const isEntering = i === current;
                const title = m.title || m.name;
                const year = (m.release_date || m.first_air_date || '').split('-')[0];
                const kind = m.media_type === 'tv' ? 'tv' : 'movie';
                const overview = m.overview?.length > 220 ? m.overview.slice(0, 220) + '…' : m.overview;

                return (
                    <div
                        key={m.id}
                        className={`hero-slide hero-slide--${isEntering ? 'enter' : 'exit'}`}
                        style={{ '--dir': direction, backgroundImage: `url(https://image.tmdb.org/t/p/original${m.backdrop_path})` }}
                    >
                        <div className="hero-overlay" />
                        <div className="hero-content">
                            <p className="hero-tag">{kind === 'tv' ? 'Series' : 'Movie'}</p>
                            <div className="hero-title">{title}</div>
                            <div className="hero-meta">
                                {m.vote_average > 0 && <span>★ {m.vote_average.toFixed(1)}</span>}
                                {year && <span>{year}</span>}
                            </div>
                            {overview && <p className="hero-overview">{overview}</p>}
                            {isEntering && (
                                <button
                                    className="hero-btn"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => navigate(`/${kind}/${m.id}`)}
                                >
                                    ▶ Watch Now
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="hero-dots">
                {movies.map((_, i) => (
                    <div key={i} className={`hero-dot${i === current ? ' hero-dot--active' : ''}`} />
                ))}
            </div>
        </div>
    );
};

export default HeroSection;

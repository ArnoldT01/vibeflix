import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

const HeroSection = ({ mediaType = 'all' }) => {
    const [movies, setMovies] = useState([]);
    const [current, setCurrent] = useState(0);
    const committedRef = useRef(0);
    const committingRef = useRef(false);
    const trackRef = useRef(null);
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
                committedRef.current = 0;
                committingRef.current = false;
            })
            .catch(() => {});
    }, [mediaType]);

    const setTrack = (offsetPx, animate) => {
        if (!trackRef.current) return;
        trackRef.current.style.transition = animate
            ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none';
        trackRef.current.style.transform = `translateX(calc(-100vw + ${offsetPx}px))`;
    };

    // After current changes, snap track back to centre without any visible flash
    useLayoutEffect(() => {
        if (!trackRef.current) return;
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = 'translateX(-100vw)';
    }, [current]);

    const commitTo = useCallback((newIdx) => {
        if (committingRef.current || newIdx === committedRef.current) return;
        if (newIdx < 0 || newIdx >= movies.length) return;
        committingRef.current = true;
        const offsetPx = newIdx > committedRef.current ? -window.innerWidth : window.innerWidth;
        setTrack(offsetPx, true);
        setTimeout(() => {
            committedRef.current = newIdx;
            setCurrent(newIdx);
            committingRef.current = false;
        }, 350);
    }, [movies.length]);

    // Auto-advance every 10s
    useEffect(() => {
        if (!movies.length) return;
        const id = setInterval(() => {
            commitTo((committedRef.current + 1) % movies.length);
        }, 10000);
        return () => clearInterval(id);
    }, [movies.length, commitTo]);

    // ── Drag helpers ──────────────────────────────────────────────
    const startDrag = (x) => {
        if (committingRef.current) return;
        dragStartX.current = x;
        isDragging.current = false;
        setTrack(0, false);
    };

    const moveDrag = (x) => {
        if (dragStartX.current === null || committingRef.current) return;
        const offset = x - dragStartX.current;
        if (Math.abs(offset) > 3) isDragging.current = true;
        if (!isDragging.current) return;
        const canNext = committedRef.current < movies.length - 1;
        const canPrev = committedRef.current > 0;
        let clamped = offset;
        if (offset < 0 && !canNext) clamped = offset * 0.12;
        if (offset > 0 && !canPrev) clamped = offset * 0.12;
        setTrack(clamped, false);
    };

    const endDrag = (x) => {
        if (dragStartX.current === null) return;
        const offset = x - dragStartX.current;
        dragStartX.current = null;
        if (!isDragging.current) { isDragging.current = false; return; }
        isDragging.current = false;
        const threshold = window.innerWidth * 0.35;
        const idx = committedRef.current;
        if (offset < -threshold && idx < movies.length - 1) commitTo(idx + 1);
        else if (offset > threshold && idx > 0) commitTo(idx - 1);
        else setTrack(0, true); // spring back
    };

    const cancelDrag = () => {
        if (isDragging.current) {
            isDragging.current = false;
            dragStartX.current = null;
            setTrack(0, true);
        }
    };

    if (!movies.length) return <div className="hero-section" />;

    const slides = [
        movies[current - 1] ?? null,
        movies[current],
        movies[current + 1] ?? null,
    ];

    const renderSlide = (m, key) => {
        if (!m) return <div key={key} className="hero-slide hero-slide--blank" />;
        const title = m.title || m.name;
        const year = (m.release_date || m.first_air_date || '').split('-')[0];
        const kind = m.media_type === 'tv' ? 'tv' : 'movie';
        const overview = m.overview?.length > 220 ? m.overview.slice(0, 220) + '…' : m.overview;
        return (
            <div
                key={key}
                className="hero-slide"
                style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${m.backdrop_path})` }}
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
                    <button
                        className="hero-btn"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => navigate(`/${kind}/${m.id}`)}
                    >
                        ▶ Watch Now
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div
            className="hero-section"
            onMouseDown={(e) => startDrag(e.clientX)}
            onMouseMove={(e) => moveDrag(e.clientX)}
            onMouseUp={(e) => endDrag(e.clientX)}
            onMouseLeave={cancelDrag}
            onTouchStart={(e) => startDrag(e.touches[0].clientX)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
            onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        >
            <div className="hero-track" ref={trackRef}>
                {renderSlide(slides[0], 'prev')}
                {renderSlide(slides[1], 'curr')}
                {renderSlide(slides[2], 'next')}
            </div>

            <div className="hero-dots">
                {movies.map((_, i) => (
                    <div key={i} className={`hero-dot${i === current ? ' hero-dot--active' : ''}`} />
                ))}
            </div>
        </div>
    );
};

export default HeroSection;

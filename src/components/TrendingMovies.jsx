import { useState, useEffect, useRef } from 'react';
import MovieCard from './MovieCard';
import Spinner from './Spinner';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

const TITLES = {
    movie: 'Trending Movies This Week',
    tv: 'Trending Series This Week',
    all: 'Trending This Week',
};

const TrendingMovies = ({ mediaType = 'all' }) => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const scrollRef = useRef(null);

    const updateArrows = () => {
        const el = scrollRef.current;
        if (!el) return;
        setAtStart(el.scrollLeft <= 0);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };

    useEffect(() => {
        setIsLoading(true);
        const kind = mediaType === 'tv' ? 'tv' : mediaType === 'movie' ? 'movie' : 'all';
        fetch(`${API_BASE_URL}/trending/${kind}/week`, API_OPTIONS)
            .then((r) => r.json())
            .then((data) => {
                setMovies((data.results || []).map((item) => ({
                    ...item,
                    title: item.title || item.name,
                    release_date: item.release_date || item.first_air_date,
                    media_type: item.media_type || kind,
                })));
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [mediaType]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateArrows();
        el.addEventListener('scroll', updateArrows);
        return () => el.removeEventListener('scroll', updateArrows);
    }, [movies]);

    const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

    return (
        <section className="trending-section">
            <h2>{TITLES[mediaType] ?? TITLES.all}</h2>
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="trending-wrapper">
                    {!atStart && <button className="scroll-btn scroll-btn-left" onClick={() => scroll(-1)} aria-label="Scroll left">&#8249;</button>}
                    <div className="trending-scroll" ref={scrollRef}>
                        {movies.map((movie) => (
                            <div className="trending-item" key={movie.id}>
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                    {!atEnd && <button className="scroll-btn scroll-btn-right" onClick={() => scroll(1)} aria-label="Scroll right">&#8250;</button>}
                </div>
            )}
        </section>
    );
};

export default TrendingMovies;

import { useState, useEffect, useRef } from "react";
import MovieCard from "./MovieCard";
import Spinner from "./Spinner";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

const TITLES = {
    movie: 'Trending Movies This Week',
    tv: 'Trending Series This Week',
    all: 'Trending This Week',
};

const TrendingMovies = ({ mediaType = 'all' }) => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        setIsLoading(true);
        const kind = mediaType === 'tv' ? 'tv' : mediaType === 'movie' ? 'movie' : 'all';
        const fetchTrending = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/trending/${kind}/week`, API_OPTIONS);
                const data = await response.json();
                const results = (data.results || []).map(item => ({
                    ...item,
                    title: item.title || item.name,
                    release_date: item.release_date || item.first_air_date,
                    media_type: item.media_type || kind,
                }));
                setMovies(results);
            } catch (e) {
                console.error('Failed to fetch trending', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, [mediaType]);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
        }
    };

    return (
        <section className="trending-section">
            <h2>{TITLES[mediaType] ?? TITLES.all}</h2>
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="trending-wrapper">
                    <button className="scroll-btn scroll-btn-left" onClick={() => scroll(-1)} aria-label="Scroll left">&#8249;</button>
                    <div className="trending-scroll" ref={scrollRef}>
                        {movies.map((movie) => (
                            <div className="trending-item" key={movie.id}>
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                    <button className="scroll-btn scroll-btn-right" onClick={() => scroll(1)} aria-label="Scroll right">&#8250;</button>
                </div>
            )}
        </section>
    );
};

export default TrendingMovies;

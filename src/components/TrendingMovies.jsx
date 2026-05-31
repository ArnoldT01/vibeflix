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

const TrendingMovies = ({ onSelect }) => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/trending/movie/week`, API_OPTIONS);
                const data = await response.json();
                setMovies(data.results || []);
            } catch (e) {
                console.error('Failed to fetch trending movies', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
        }
    };

    return (
        <section className="trending-section">
            <h2>Trending Movies This Week</h2>
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="trending-wrapper">
                    <button className="scroll-btn scroll-btn-left" onClick={() => scroll(-1)} aria-label="Scroll left">&#8249;</button>
                    <div className="trending-scroll" ref={scrollRef}>
                        {movies.map((movie) => (
                            <div className="trending-item" key={movie.id}>
                                <MovieCard movie={movie} onSelect={onSelect} />
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

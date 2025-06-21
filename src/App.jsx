import { React, useState, useEffect } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import "./App.css"

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [trendingMovies, setTrendingMovies] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // add loading and error message for trending movies

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '', page = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoadingInitial(true);
        }

        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) throw new Error('Failed to fetch movies');

            const data = await response.json();

            if (data.results.length === 0) {
                setHasMorePages(false);
                return;
            }

            setMovieList(prev => isLoadMore ? [...prev, ...data.results] : data.results);

            if (query && data.results.length > 0 && page === 1) {
                await updateSearchCount(query, data.results[0]);
            }

            setHasMorePages(data.page < data.total_pages);

        } catch (error) {
            console.log(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            if (isLoadMore) {
                setIsLoadingMore(false);
            } else {
                setIsLoadingInitial(false);
            }
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        setCurrentPage(1);
        setHasMorePages(true);
        fetchMovies(debouncedSearchTerm, 1, false);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending On the site</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoadingInitial ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <>
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </ul>

                            {hasMorePages && !isLoadingMore && (
                                <button
                                    onClick={() => {
                                        const nextPage = currentPage + 1;
                                        setCurrentPage(nextPage);
                                        fetchMovies(debouncedSearchTerm, nextPage, true);
                                    }}
                                    className="load-more"
                                >
                                    Load More
                                </button>
                            )}

                            {isLoadingMore && <Spinner />}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App
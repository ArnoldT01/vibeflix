import { useState, useEffect, useRef } from "react";
import Search from "./components/Search";
import Filters from "./components/Filters";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
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

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedMovie, setSelectedMovie] = useState(null);

    const [genres, setGenres] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [ratingSort, setRatingSort] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');

    const debounceTimer = useRef(null);
    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
                const data = await response.json();
                setGenres(data.genres || []);
            } catch (e) {
                console.log('Failed to fetch genres', e);
            }
        };
        fetchGenres();
    }, []);

    const fetchMovies = async (query = '', page = 1, isLoadMore = false, filters = {}) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoadingInitial(true);
        }

        setErrorMessage('');

        try {
            const { year, genre, sort } = filters;

            let endpoint;
            if (query) {
                const params = new URLSearchParams({ query, page });
                if (year) params.set('year', year);
                endpoint = `${API_BASE_URL}/search/movie?${params}`;
            } else {
                const sortBy = sort === 'asc' ? 'vote_average.asc' : sort === 'desc' ? 'vote_average.desc' : 'popularity.desc';
                const params = new URLSearchParams({ sort_by: sortBy, page });
                if (sort) params.set('vote_count.gte', 50);
                if (year) params.set('primary_release_year', year);
                if (genre) params.set('with_genres', genre);
                endpoint = `${API_BASE_URL}/discover/movie?${params}`;
            }

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) throw new Error('Failed to fetch movies');

            const data = await response.json();

            if (data.results.length === 0) {
                setHasMorePages(false);
                return;
            }

            let results = data.results;
            if (query && sort === 'asc') results = [...results].sort((a, b) => a.vote_average - b.vote_average);
            if (query && sort === 'desc') results = [...results].sort((a, b) => b.vote_average - a.vote_average);

            setMovieList(prev => isLoadMore ? [...prev, ...results] : results);

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

    useEffect(() => {
        setCurrentPage(1);
        setHasMorePages(true);
        fetchMovies(debouncedSearchTerm, 1, false, { year: selectedYear, genre: selectedGenre, sort: ratingSort });
    }, [debouncedSearchTerm, selectedYear, selectedGenre, ratingSort]);

    return (
        <>
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>

                    <Filters
                        genres={genres}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        ratingSort={ratingSort}
                        setRatingSort={setRatingSort}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                </header>

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
                                    <MovieCard key={movie.id} movie={movie} onSelect={setSelectedMovie} />
                                ))}
                            </ul>

                            {hasMorePages && !isLoadingMore && (
                                <button
                                    onClick={() => {
                                        const nextPage = currentPage + 1;
                                        setCurrentPage(nextPage);
                                        fetchMovies(debouncedSearchTerm, nextPage, true, { year: selectedYear, genre: selectedGenre, sort: ratingSort });
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

        {selectedMovie && (
            <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
        )}
    </>
    )
}

export default App;
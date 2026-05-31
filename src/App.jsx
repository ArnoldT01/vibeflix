import { useState, useEffect, useRef } from "react";
import Search from "./components/Search";
import Filters from "./components/Filters";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import TrendingMovies from "./components/TrendingMovies";
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

    const [genres, setGenres] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [ratingSort, setRatingSort] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [mediaType, setMediaType] = useState('all');

    const debounceTimer = useRef(null);
    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(debounceTimer.current);
    }, [searchTerm]);

    useEffect(() => {
        const fetchGenres = async () => {
            const kind = mediaType === 'tv' ? 'tv' : 'movie';
            try {
                const response = await fetch(`${API_BASE_URL}/genre/${kind}/list`, API_OPTIONS);
                const data = await response.json();
                setGenres(data.genres || []);
                setSelectedGenre('');
            } catch (e) {
                console.log('Failed to fetch genres', e);
            }
        };
        fetchGenres();
    }, [mediaType]);

    const fetchMovies = async (query = '', page = 1, isLoadMore = false, filters = {}, type = 'all') => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoadingInitial(true);
        }

        setErrorMessage('');

        try {
            const { year, genre, sort } = filters;
            const kind = type === 'tv' ? 'tv' : 'movie';

            let endpoint;
            if (query) {
                const params = new URLSearchParams({ query, page });
                if (year) params.set(kind === 'tv' ? 'first_air_date_year' : 'year', year);
                endpoint = `${API_BASE_URL}/search/${kind}?${params}`;
            } else {
                const sortBy = sort === 'asc' ? 'vote_average.asc' : sort === 'desc' ? 'vote_average.desc' : 'popularity.desc';
                const params = new URLSearchParams({ sort_by: sortBy, page });
                if (sort) params.set('vote_count.gte', 50);
                if (year) params.set(kind === 'tv' ? 'first_air_date_year' : 'primary_release_year', year);
                if (genre) params.set('with_genres', genre);
                endpoint = `${API_BASE_URL}/discover/${kind}?${params}`;
            }

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();

            if (data.results.length === 0) {
                setHasMorePages(false);
                return;
            }

            let results = data.results.map(item => ({
                ...item,
                title: item.title || item.name,
                release_date: item.release_date || item.first_air_date,
                media_type: kind,
            }));

            if (query && sort === 'asc') results = [...results].sort((a, b) => a.vote_average - b.vote_average);
            if (query && sort === 'desc') results = [...results].sort((a, b) => b.vote_average - a.vote_average);

            setMovieList(prev => isLoadMore ? [...prev, ...results] : results);
            setHasMorePages(data.page < data.total_pages);

        } catch (error) {
            console.log(`Error fetching: ${error}`);
            setErrorMessage('Error fetching results. Please try again later.');
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
        fetchMovies(debouncedSearchTerm, 1, false, { year: selectedYear, genre: selectedGenre, sort: ratingSort }, mediaType);
    }, [debouncedSearchTerm, selectedYear, selectedGenre, ratingSort, mediaType]);

    return (
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
                        mediaType={mediaType}
                        setMediaType={setMediaType}
                    />
                </header>

                {!searchTerm && !selectedYear && !ratingSort && !selectedGenre && (
                    <TrendingMovies mediaType={mediaType} />
                )}

                <section className="all-movies">
                    <h2>{mediaType === 'tv' ? 'All Series' : mediaType === 'movie' ? 'All Movies' : 'All'}</h2>

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
                                        fetchMovies(debouncedSearchTerm, nextPage, true, { year: selectedYear, genre: selectedGenre, sort: ratingSort }, mediaType);
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

export default App;
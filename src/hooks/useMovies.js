import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

export const useMovies = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

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
        const kind = mediaType === 'tv' ? 'tv' : 'movie';
        fetch(`${API_BASE_URL}/genre/${kind}/list`, API_OPTIONS)
            .then((r) => r.json())
            .then((data) => { setGenres(data.genres || []); setSelectedGenre(''); })
            .catch((e) => console.error('Failed to fetch genres', e));
    }, [mediaType]);

    const fetchMovies = async (query = '', page = 1, isLoadMore = false, filters = {}, type = 'all') => {
        if (isLoadMore) setIsLoadingMore(true);
        else setIsLoadingInitial(true);

        setErrorMessage('');

        try {
            const { year, genre, sort } = filters;

            const buildEndpoint = (kind) => {
                if (query) {
                    const params = new URLSearchParams({ query, page });
                    if (year) params.set(kind === 'tv' ? 'first_air_date_year' : 'year', year);
                    return `${API_BASE_URL}/search/${kind}?${params}`;
                } else {
                    const sortBy = sort === 'asc' ? 'vote_average.asc' : sort === 'desc' ? 'vote_average.desc' : 'popularity.desc';
                    const params = new URLSearchParams({ sort_by: sortBy, page });
                    if (sort) params.set('vote_count.gte', 50);
                    if (year) params.set(kind === 'tv' ? 'first_air_date_year' : 'primary_release_year', year);
                    if (genre) params.set('with_genres', genre);
                    return `${API_BASE_URL}/discover/${kind}?${params}`;
                }
            };

            const mapResults = (items, kind) => items.map((item) => ({
                ...item,
                title: item.title || item.name,
                release_date: item.release_date || item.first_air_date,
                media_type: kind,
            }));

            let results, hasMore;

            if (type === 'all') {
                const [movieRes, tvRes] = await Promise.all([
                    fetch(buildEndpoint('movie'), API_OPTIONS),
                    fetch(buildEndpoint('tv'), API_OPTIONS),
                ]);
                if (!movieRes.ok || !tvRes.ok) throw new Error('Failed to fetch');
                const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);

                const combined = [
                    ...mapResults(movieData.results || [], 'movie'),
                    ...mapResults(tvData.results || [], 'tv'),
                ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

                results = combined;
                hasMore = movieData.page < movieData.total_pages || tvData.page < tvData.total_pages;
            } else {
                const kind = type === 'tv' ? 'tv' : 'movie';
                const response = await fetch(buildEndpoint(kind), API_OPTIONS);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                results = mapResults(data.results || [], kind);
                hasMore = data.page < data.total_pages;
            }

            if (results.length === 0) { setHasMorePages(false); return; }

            if (sort === 'asc') results = [...results].sort((a, b) => a.vote_average - b.vote_average);
            if (sort === 'desc') results = [...results].sort((a, b) => b.vote_average - a.vote_average);

            setMovieList((prev) => (isLoadMore ? [...prev, ...results] : results));
            setHasMorePages(hasMore);
        } catch (error) {
            console.error('Error fetching:', error);
            setErrorMessage('Error fetching results. Please try again later.');
        } finally {
            if (isLoadMore) setIsLoadingMore(false);
            else setIsLoadingInitial(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        setHasMorePages(true);
        fetchMovies(debouncedSearchTerm, 1, false, { year: selectedYear, genre: selectedGenre, sort: ratingSort }, mediaType);
    }, [debouncedSearchTerm, selectedYear, selectedGenre, ratingSort, mediaType]);

    const loadMore = () => {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchMovies(debouncedSearchTerm, next, true, { year: selectedYear, genre: selectedGenre, sort: ratingSort }, mediaType);
    };

    return {
        searchTerm, setSearchTerm,
        movieList, errorMessage,
        isLoadingInitial, isLoadingMore,
        hasMorePages,
        genres, selectedYear, setSelectedYear,
        ratingSort, setRatingSort,
        selectedGenre, setSelectedGenre,
        mediaType, setMediaType,
        loadMore,
    };
};

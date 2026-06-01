import { useMovies } from '../hooks/useMovies';
import Search from '../components/Search';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import TrendingMovies from '../components/TrendingMovies';
import '../styles/home.css';

const HomePage = () => {
    const {
        searchTerm, setSearchTerm,
        movieList, errorMessage,
        isLoadingInitial, isLoadingMore,
        hasMorePages,
        genres, selectedYear, setSelectedYear,
        ratingSort, setRatingSort,
        selectedGenre, setSelectedGenre,
        mediaType, setMediaType,
        loadMore,
    } = useMovies();

    return (
        <main>
            <div className="wrapper">
                <nav className="flex items-center gap-3 mb-6">
                    <img src="/favicon.svg" alt="VibeFlix" className="w-10 h-10" />
                    <span className="text-gradient" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.06em' }}>
                        VibeFlix
                    </span>
                </nav>
                <header>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
                                <button onClick={loadMore} className="load-more">Load More</button>
                            )}
                            {isLoadingMore && <Spinner />}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default HomePage;

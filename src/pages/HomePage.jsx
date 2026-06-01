import { useMovies } from '../hooks/useMovies';
import Search from '../components/Search';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import TrendingMovies from '../components/TrendingMovies';
import HeroSection from '../components/HeroSection';
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
            <nav className="site-nav">
                <img src="/favicon.svg" alt="VibeFlix" className="w-9 h-9" />
                <span className="text-gradient" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.75rem', letterSpacing: '0.06em' }}>
                    VibeFlix
                </span>
            </nav>

            <HeroSection mediaType={mediaType} />

            <div className="wrapper">
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
                                {movieList.map((movie, i) => (
                                    <MovieCard key={movie.id} movie={movie} index={i} />
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

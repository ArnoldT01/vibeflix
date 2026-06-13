import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../context/AuthContext';
import Search from '../components/Search';
import Filters from '../components/Filters';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import TrendingMovies from '../components/TrendingMovies';
import HeroSection from '../components/HeroSection';
import '../styles/home.css';
import '../styles/auth.css';

const UserMenu = () => {
    const { session, signOut, setAuthModal } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    if (!session) {
        return (
            <button className="nav-user-btn" onClick={() => setAuthModal(true)}>
                Sign In
            </button>
        );
    }

    const initial = (session.user.email?.[0] ?? '?').toUpperCase();

    return (
        <div ref={ref} style={{ position: 'relative', marginLeft: 'auto' }}>
            <button className="nav-user-btn nav-user-btn--avatar" onClick={() => setOpen((o) => !o)}>
                <div className="nav-user-avatar">{initial}</div>
            </button>
            {open && (
                <div className="nav-user-menu" onClick={() => setOpen(false)}>
                    <Link to="/library">My Library</Link>
                    <div className="menu-divider" />
                    <button onClick={signOut}>Sign Out</button>
                </div>
            )}
        </div>
    );
};

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
                <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="VibeFlix" className="w-9 h-9" />
                <span className="text-gradient" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.75rem', letterSpacing: '0.06em' }}>
                    VibeFlix
                </span>
                <UserMenu />
            </nav>

            <HeroSection mediaType={mediaType} />

            <div className="wrapper">
                <TrendingMovies mediaType="all" />

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

                <section className="all-movies">
                    <h2 className="section-title">{mediaType === 'tv' ? 'All Series' : mediaType === 'movie' ? 'All Movies' : mediaType === 'anime' ? 'Anime' : 'All'}</h2>
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

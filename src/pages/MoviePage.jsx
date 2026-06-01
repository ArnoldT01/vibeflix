import { useEffect, useState } from "react";
import { useParams, useNavigate, useMatch, Link } from "react-router-dom";
import "../App.css";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: "GET",
    headers: { accept: "application/json", Authorization: `Bearer ${API_KEY}` },
};

const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
};

const MoviePage = () => {
    const { id } = useParams();
    const tvMatch = useMatch("/tv/:id");
    const pathKind = tvMatch ? "tv" : "movie";
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [view, setView] = useState("info"); // "info" | "trailer" | "watch"

    // movies
    const [collection, setCollection] = useState(null);

    // tv
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [seasonEpisodes, setSeasonEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [selectedEp, setSelectedEp] = useState(null); // { season, episode }

    useEffect(() => {
        window.scrollTo(0, 0);
        setCollection(null);
        setSelectedSeason(null);
        setSeasonEpisodes([]);
        setSelectedEp(null);
        setView("info");

        const fetch_ = async () => {
            const res = await fetch(`${API_BASE_URL}/${pathKind}/${id}?append_to_response=videos`, API_OPTIONS);
            const data = await res.json();
            setDetails(data);

            const trailer = data.videos?.results?.find(
                (v) => v.type === "Trailer" && v.site === "YouTube"
            );
            setTrailerKey(trailer?.key ?? null);

            if (pathKind === "movie" && data.belongs_to_collection) {
                const colRes = await fetch(`${API_BASE_URL}/collection/${data.belongs_to_collection.id}`, API_OPTIONS);
                const colData = await colRes.json();
                setCollection(colData);
            }

            if (pathKind === "tv" && data.seasons?.length) {
                const first = data.seasons.find((s) => s.season_number > 0) ?? data.seasons[0];
                setSelectedSeason(first.season_number);
            }
        };
        fetch_();
    }, [id, pathKind]);

    useEffect(() => {
        if (pathKind !== "tv" || selectedSeason === null) return;
        setLoadingEpisodes(true);
        setSeasonEpisodes([]);
        fetch(`${API_BASE_URL}/tv/${id}/season/${selectedSeason}`, API_OPTIONS)
            .then((r) => r.json())
            .then((d) => { setSeasonEpisodes(d.episodes ?? []); setLoadingEpisodes(false); });
    }, [selectedSeason, id, pathKind]);

    if (!details) {
        return (
            <div className="page-loading">
                <div className="page-spinner" />
            </div>
        );
    }

    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || "").split("-")[0];
    const runtimeMins = pathKind === "tv"
        ? details.episode_run_time?.[0]
        : details.runtime;
    const runtime = formatRuntime(runtimeMins);
    const genres = details.genres?.map((g) => g.name).join(" • ") ?? "";
    const backdrop = details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : null;
    const embedBase = import.meta.env.VITE_PLAYER_URL;
    const embedSrc = pathKind === "tv"
        ? selectedEp
            ? `${embedBase}/tv/${id}/${selectedEp.season}/${selectedEp.episode}?autoplay=false`
            : `${embedBase}/tv/${id}?autoplay=false`
        : `${embedBase}/movie/${id}?autoplay=false`;

    return (
        <div className="movie-page">
            {/* Hero */}
            <div className="movie-page-hero" style={backdrop ? { backgroundImage: `url(${backdrop})` } : {}}>
                <div className="movie-page-hero-overlay" />
                <button className="page-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <div className="movie-page-hero-content">
                    <h1 className="movie-page-title">{title}</h1>
                    <div className="movie-page-tags">
                        {details.vote_average > 0 && (
                            <span>★ {details.vote_average.toFixed(1)}</span>
                        )}
                        {year && <span>{year}</span>}
                        {runtime && <span>{runtime}</span>}
                        {genres && <span>{genres}</span>}
                    </div>
                    {details.overview && (
                        <p className="movie-page-overview">{details.overview}</p>
                    )}
                    <div className="movie-page-actions">
                        <button
                            className="page-btn page-btn--watch"
                            onClick={() => setView(view === "watch" ? "info" : "watch")}
                        >
                            {view === "watch" ? "✕ Close Player" : "▶ Watch Now"}
                        </button>
                        {trailerKey && (
                            <button
                                className="page-btn page-btn--trailer"
                                onClick={() => setView(view === "trailer" ? "info" : "trailer")}
                            >
                                {view === "trailer" ? "Hide Trailer" : "Trailer"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Player */}
            {(view === "watch" || view === "trailer") && (
                <div className="movie-page-player-wrap">
                    <div className="movie-page-player">
                        {view === "watch" ? (
                            <iframe
                                src={embedSrc}
                                title={title}
                                allowFullScreen
                                referrerPolicy="origin"
                            />
                        ) : (
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                title={`${title} trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Movie franchise / collection */}
            {pathKind === "movie" && collection && collection.parts?.length > 1 && (
                <div className="movie-page-section">
                    <h2 className="detail-section-title">{collection.name}</h2>
                    <div className="franchise-scroll">
                        {[...collection.parts]
                            .sort((a, b) => (a.release_date ?? "").localeCompare(b.release_date ?? ""))
                            .map((part) => (
                                <Link
                                    key={part.id}
                                    to={`/movie/${part.id}`}
                                    className={`franchise-card${part.id === parseInt(id) ? " franchise-card--active" : ""}`}
                                >
                                    {part.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${part.poster_path}`}
                                            alt={part.title}
                                            className="franchise-card-img"
                                        />
                                    ) : (
                                        <div className="franchise-card-placeholder" />
                                    )}
                                    <div className="franchise-card-info">
                                        <span className="franchise-card-title">{part.title}</span>
                                        <span className="franchise-card-year">{(part.release_date ?? "").split("-")[0]}</span>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            )}

            {/* TV seasons & episodes */}
            {pathKind === "tv" && details.seasons?.length > 0 && (
                <div className="movie-page-section">
                    <h2 className="detail-section-title">Episodes</h2>
                    <div className="season-tabs">
                        {details.seasons
                            .filter((s) => s.season_number > 0)
                            .map((s) => (
                                <button
                                    key={s.season_number}
                                    className={`season-tab${selectedSeason === s.season_number ? " season-tab--active" : ""}`}
                                    onClick={() => setSelectedSeason(s.season_number)}
                                >
                                    Season {s.season_number}
                                </button>
                            ))}
                    </div>
                    {loadingEpisodes ? (
                        <div className="episodes-loading"><div className="page-spinner" /></div>
                    ) : (
                        <div className="episodes-list">
                            {seasonEpisodes.map((ep) => {
                                const isActive = selectedEp?.season === selectedSeason && selectedEp?.episode === ep.episode_number;
                                return (
                                    <button
                                        key={ep.episode_number}
                                        className={`episode-item${isActive ? " episode-item--active" : ""}`}
                                        onClick={() => {
                                            setSelectedEp({ season: selectedSeason, episode: ep.episode_number });
                                            setView("watch");
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    >
                                        <div className="episode-thumb">
                                            {ep.still_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                    alt={ep.name}
                                                />
                                            ) : (
                                                <div className="episode-thumb-placeholder" />
                                            )}
                                            <span className="episode-play-icon">▶</span>
                                        </div>
                                        <div className="episode-info">
                                            <div className="episode-header">
                                                <span className="episode-number">E{ep.episode_number}</span>
                                                <span className="episode-name">{ep.name}</span>
                                            </div>
                                            {ep.air_date && (
                                                <span className="episode-date">{ep.air_date}</span>
                                            )}
                                            {ep.overview && (
                                                <p className="episode-overview">{ep.overview}</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MoviePage;

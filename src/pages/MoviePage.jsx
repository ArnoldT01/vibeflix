import { useEffect, useState } from "react";
import { useParams, useNavigate, useMatch } from "react-router-dom";
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

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetch_ = async () => {
            const res = await fetch(`${API_BASE_URL}/${pathKind}/${id}?append_to_response=videos`, API_OPTIONS);
            const data = await res.json();
            setDetails(data);

            const trailer = data.videos?.results?.find(
                (v) => v.type === "Trailer" && v.site === "YouTube"
            );
            setTrailerKey(trailer?.key ?? null);
        };
        fetch_();
    }, [id, pathKind]);

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
    const embedBase = import.meta.env.VITE_EMBED_BASE_URL;
    const embedSrc = pathKind === "tv"
        ? `${embedBase}/tv/${id}`
        : `${embedBase}/movie/${id}`;

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
        </div>
    );
};

export default MoviePage;

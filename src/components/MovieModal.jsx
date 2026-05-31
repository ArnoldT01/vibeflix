import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: "GET",
    headers: { accept: "application/json", Authorization: `Bearer ${API_KEY}` },
};

const MovieModal = ({ movie, onClose }) => {
    const [details, setDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const res = await fetch(
                `${API_BASE_URL}/movie/${movie.id}?append_to_response=videos`,
                API_OPTIONS
            );
            const data = await res.json();
            setDetails(data);

            const trailer = data.videos?.results?.find(
                (v) => v.type === "Trailer" && v.site === "YouTube"
            );
            setTrailerKey(trailer?.key ?? null);
        };
        fetchDetails();
    }, [movie.id]);

    // Close on backdrop click or Escape key
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const genres = details?.genres?.map((g) => g.name).join(", ") ?? "";
    const runtime = details?.runtime
        ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
        : null;
    const backdrop = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null;

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal">
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                {backdrop && (
                    <img src={backdrop} alt={movie.title} className="modal-backdrop-img" />
                )}

                <div className="modal-body">
                    <div className="modal-meta">
                        <h2 className="modal-title">{movie.title}</h2>

                        <div className="modal-tags">
                            {movie.vote_average > 0 && (
                                <span className="modal-tag">
                                    ★ {movie.vote_average.toFixed(1)}
                                </span>
                            )}
                            {movie.release_date && (
                                <span className="modal-tag">{movie.release_date.split("-")[0]}</span>
                            )}
                            {runtime && <span className="modal-tag">{runtime}</span>}
                            {genres && <span className="modal-tag">{genres}</span>}
                        </div>

                        {movie.overview && (
                            <p className="modal-overview">{movie.overview}</p>
                        )}
                    </div>

                    {trailerKey ? (
                        <div className="modal-player">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                title={`${movie.title} trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : details && (
                        <p className="modal-no-trailer">No trailer available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieModal;

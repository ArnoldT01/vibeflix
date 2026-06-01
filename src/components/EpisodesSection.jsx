import { useState, useEffect } from 'react';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';

const EpisodesSection = ({ id, seasons, selectedEp, onEpisodeSelect }) => {
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [seasonEpisodes, setSeasonEpisodes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!seasons?.length) return;
        const first = seasons.find((s) => s.season_number > 0) ?? seasons[0];
        setSelectedSeason(first.season_number);
    }, [seasons]);

    useEffect(() => {
        if (selectedSeason === null) return;
        setLoading(true);
        setSeasonEpisodes([]);
        fetch(`${API_BASE_URL}/tv/${id}/season/${selectedSeason}`, API_OPTIONS)
            .then((r) => r.json())
            .then((d) => { setSeasonEpisodes(d.episodes ?? []); setLoading(false); });
    }, [selectedSeason, id]);

    if (!seasons?.length) return null;

    return (
        <div className="movie-page-section">
            <h2 className="detail-section-title">Episodes</h2>
            <div className="season-tabs">
                {seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                        <button
                            key={s.season_number}
                            className={`season-tab${selectedSeason === s.season_number ? ' season-tab--active' : ''}`}
                            onClick={() => setSelectedSeason(s.season_number)}
                        >
                            Season {s.season_number}
                        </button>
                    ))}
            </div>
            {loading ? (
                <div className="episodes-loading"><div className="page-spinner" /></div>
            ) : (
                <div className="episodes-list">
                    {seasonEpisodes.map((ep) => {
                        const isActive = selectedEp?.season === selectedSeason && selectedEp?.episode === ep.episode_number;
                        return (
                            <button
                                key={ep.episode_number}
                                className={`episode-item${isActive ? ' episode-item--active' : ''}`}
                                onClick={() => onEpisodeSelect({ season: selectedSeason, episode: ep.episode_number })}
                            >
                                <div className="episode-thumb">
                                    {ep.still_path ? (
                                        <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.name} />
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
                                    {ep.air_date && <span className="episode-date">{ep.air_date}</span>}
                                    {ep.overview && <p className="episode-overview">{ep.overview}</p>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EpisodesSection;

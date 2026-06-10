import { useEffect, useState } from 'react';
import { useParams, useNavigate, useMatch } from 'react-router-dom';
import { API_BASE_URL, API_OPTIONS } from '../lib/tmdb';
import '../styles/detail.css';

const IMG = 'https://image.tmdb.org/t/p';

const CastPage = () => {
    const { id } = useParams();
    const tvMatch = useMatch('/tv/:id/cast');
    const pathKind = tvMatch ? 'tv' : 'movie';
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [cast, setCast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const load = async () => {
            const [detailRes, creditsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/${pathKind}/${id}`, API_OPTIONS),
                fetch(`${API_BASE_URL}/${pathKind}/${id}/credits`, API_OPTIONS),
            ]);
            const [detail, credits] = await Promise.all([detailRes.json(), creditsRes.json()]);
            setTitle(detail.title || detail.name || '');
            setCast(credits.cast || []);
            setLoading(false);
        };
        load();
    }, [id, pathKind]);

    if (loading) {
        return <div className="page-loading"><div className="page-spinner" /></div>;
    }

    return (
        <div className="cast-page">
            <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
            </button>

            <div className="cast-page-inner">
                <div className="cast-page-header">
                    <h1 className="cast-page-title">{title}</h1>
                    <p className="cast-page-subtitle">Full Cast · {cast.length} members</p>
                </div>

                <div className="cast-grid cast-grid--full">
                    {cast.map((p) => (
                        <div className="cast-card" key={`${p.id}-${p.cast_id ?? p.order}`}>
                            <div className="cast-photo">
                                {p.profile_path ? (
                                    <img src={`${IMG}/w185${p.profile_path}`} alt={p.name} />
                                ) : (
                                    <div className="cast-photo-placeholder" />
                                )}
                            </div>
                            <p className="cast-name">{p.name}</p>
                            <p className="cast-character">{p.character}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CastPage;

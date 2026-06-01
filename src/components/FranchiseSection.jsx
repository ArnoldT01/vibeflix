import { Link } from 'react-router-dom';

const FranchiseSection = ({ collection, currentId }) => {
    if (!collection || collection.parts?.length <= 1) return null;

    return (
        <div className="movie-page-section">
            <h2 className="detail-section-title">{collection.name}</h2>
            <div className="franchise-scroll">
                {[...collection.parts]
                    .sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))
                    .map((part) => (
                        <Link
                            key={part.id}
                            to={`/movie/${part.id}`}
                            className={`franchise-card${part.id === currentId ? ' franchise-card--active' : ''}`}
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
                                <span className="franchise-card-year">{(part.release_date ?? '').split('-')[0]}</span>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default FranchiseSection;

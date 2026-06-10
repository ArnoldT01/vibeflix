import React from "react";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2006 }, (_, i) => currentYear - i);

const Filters = ({ genres, selectedYear, setSelectedYear, ratingSort, setRatingSort, selectedGenre, setSelectedGenre, mediaType, setMediaType }) => {
    return (
        <div className="filters">
            <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                aria-label="Filter by type"
            >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="tv">Series</option>
                <option value="anime">Anime</option>
            </select>

            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                aria-label="Filter by year"
            >
                <option value="">All Years</option>
                {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
                <option value="pre2006">Pre 2006</option>
            </select>

            <select
                value={ratingSort}
                onChange={(e) => setRatingSort(e.target.value)}
                aria-label="Sort by rating"
            >
                <option value="">Rating</option>
                <option value="asc">Rating: Low to High</option>
                <option value="desc">Rating: High to Low</option>
            </select>

            <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                aria-label="Filter by genre"
            >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
            </select>
        </div>
    );
};

export default Filters;

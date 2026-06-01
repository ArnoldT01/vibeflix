export const API_BASE_URL = 'https://api.themoviedb.org/3';
export const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
    },
};

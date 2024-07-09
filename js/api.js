
const api = (function() {
    const API_KEY = "75255e19";
    const API_URL = "https://www.omdbapi.com/?apikey=" + API_KEY;

    /**
     * Searches for movies based on the provided query.
     * @param {string} query - The search query for finding movies.
     * @returns {Promise<Object>} A promise that resolves to the search results in JSON format.
     */
    function searchMovies(query) {
        return fetch(`${API_URL}&s=${encodeURIComponent(query)}`)
            .then(response => response.json());
    }

    /**
     * Fetches detailed information about a specific movie.
     * @param {string} movieId - The IMDb ID of the movie.
     * @returns {Promise<Object>} A promise that resolves to the movie details in JSON format.
     */
    function fetchMovieDetails(movieId) {
        return fetch(`${API_URL}&i=${encodeURIComponent(movieId)}`)
            .then(response => response.json());
    }

    return {
        searchMovies,
        fetchMovieDetails
    };
})();

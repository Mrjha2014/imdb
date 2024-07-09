/**
 * A module for managing favorites in local storage.
 * @module storage
 */

/**
 * The key used to store favorites in local storage.
 * @constant {string}
 */
const FAVORITES_KEY = 'favorites';

// Select the toast containers from the DOM
const toastAdded = document.getElementById('toastAdded');
const toastRemoved = document.getElementById('toastRemoved');

/**
 * Retrieves the list of favorite movie IDs from local storage.
 * @returns {Array} The list of favorite movie IDs.
 */
function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

/**
 * Adds a movie ID to the list of favorites in local storage.
 * Triggers a toast notification when a movie is added.
 * @param {string} movieId - The ID of the movie to add to favorites.
 */
function addFavorite(movieId) {
    let favorites = getFavorites();
    if (!favorites.includes(movieId)) {
        favorites.push(movieId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        triggerToast('Added to favorites!', 'success');
    }
}

/**
 * Removes a movie ID from the list of favorites in local storage.
 * Triggers a toast notification when a movie is removed.
 * @param {string} movieId - The ID of the movie to remove from favorites.
 */
function removeFavorite(movieId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(movieId);
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        triggerToast('Removed from favorites!', 'danger');
    }
}

/**
 * Triggers a toast notification using existing toast containers in the HTML.
 * @param {string} message - The message to display in the toast.
 * @param {string} type - The type of toast: 'success', 'info', 'warning', 'danger'.
 */
function triggerToast(message, type) {
    // Select the appropriate toast container based on the type
    const toastContainer = type === 'success' ? toastAdded : toastRemoved;

    // Update the toast message
    const toastBody = toastContainer.querySelector('.toast-body');
    toastBody.textContent = message;

    // Show the toast using Bootstrap's API
    const bsToast = new bootstrap.Toast(toastContainer);
    bsToast.show();
}

/**
 * The public interface of the storage module.
 * @namespace
 */
const storage = {
    getFavorites,
    addFavorite,
    removeFavorite
};


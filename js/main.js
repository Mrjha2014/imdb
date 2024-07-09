document.addEventListener("DOMContentLoaded", function () {
  const searchBox = document.getElementById("searchBox");
  const searchResults = document.getElementById("searchResults");
  const favoritesList = document.getElementById("favoritesList");

  // Initialize event listeners and functionalities
  if (searchBox) {
    initializeSearch();
  }

  if (favoritesList) {
    displayFavorites();
  }

  const movieId = getMovieIdFromURL();
  if (movieId) {
    displayMovieDetails(movieId);
  }

  /**
   * Initializes the search functionality by adding an event listener to the search box.
   */
  function initializeSearch() {
    searchBox.addEventListener("input", function () {
      const query = searchBox.value.trim();
      if (query) {
        api.searchMovies(query).then((data) => {
          if (data.Response === "True") {
            displaySearchResults(data.Search);
          } else {
            searchResults.innerHTML =
              '<p class="text-center">No movies found.</p>';
          }
        });
      } else {
        searchResults.innerHTML = ""; // Clear search results if query is emptied
      }
    });
  }

  /**
   * Displays the search results by creating and appending movie elements to the searchResults container.
   * @param {Array} movies - Array of movie objects to display.
   */
  function displaySearchResults(movies) {
    searchResults.innerHTML = ""; // Clear previous results
    const favorites = storage.getFavorites(); // Get the list of favorite movie IDs

    movies.forEach((movie) => {
      const poster =
        movie.Poster !== "N/A"
          ? movie.Poster
          : "https://placehold.co/800?text=No+Poster";
      const isFavorite = favorites.includes(movie.imdbID); // Check if the current movie is in favorites

      const movieElement = document.createElement("div");
      movieElement.classList.add(
        "movie-card",
        "col-6",
        "col-md-4",
        "col-lg-3",
        "mb-4"
      );
      movieElement.innerHTML = `
            <div class="card h-100 shadow-sm"> 
                <a href="movie.html?id=${movie.imdbID}" class="text-decoration-none text-dark d-block position-relative"> 
                    <img src="${poster}" alt="${movie.Title}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title mb-0">${movie.Title}</h5>
                        <p class="card-text">${movie.Year}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 position-absolute bottom-0 start-50 translate-middle-x"> 
                        <i class="bi ${isFavorite ? "bi-heart-fill" : "bi-heart"
        } add-favorite fs-4" data-movieid="${movie.imdbID
        }" style="cursor: pointer;"></i>
                    </div>
                </a>
            </div>
        `;
      searchResults.appendChild(movieElement);
    });
    updateFavoritesBadge(); // Update favorites badge after displaying search results
    attachAddToFavoritesEventListeners();
  }

  /**
  * Attaches event listeners to "Add to Favorites" buttons.
  */
  function attachAddToFavoritesEventListeners() {
    const icons = document.querySelectorAll(".add-favorite, .remove-favorite");
    icons.forEach((icon) => {
      icon.addEventListener("click", function (event) {
        event.preventDefault();
        const movieId = this.getAttribute("data-movieid");

        if (this.classList.contains("bi-heart-fill")) {
          // Already favorite, so remove it
          storage.removeFavorite(movieId);
          this.classList.remove("bi-heart-fill");
          this.classList.add("bi-heart");
          this.classList.add("add-favorite");
          this.classList.remove("remove-favorite");
        } else {
          // Not a favorite yet, add it
          storage.addFavorite(movieId);
          this.classList.remove("bi-heart");
          this.classList.add("bi-heart-fill");
          this.classList.remove("add-favorite");
          this.classList.add("remove-favorite");
        }

        updateFavoritesBadge(); // Update the favorites badge after adding/removing
        displayFavorites(); // Update the favorites list immediately
      });
    });
  }

  /**
   * Displays the list of favorite movies by fetching their details and appending them to the favoritesList container.
   */
  function displayFavorites() {
    const favorites = storage.getFavorites();
    favoritesList.innerHTML = ""; // Clear current list

    // Fetch details for all favorites and then process them
    const fetchPromises = favorites.map((movieId) =>
      api.fetchMovieDetails(movieId)
    );

    Promise.all(fetchPromises)
      .then((movies) => {
        movies.forEach((movie) => {
          if (movie.Response === "True") {
            const poster =
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://placehold.co/800?text=No+Poster"; // Default poster image if not available

            const movieElement = document.createElement("div");
            movieElement.classList.add(
              "movie-card",
              "col-6",
              "col-md-4",
              "col-lg-3",
              "mb-4"
            );
            movieElement.innerHTML = `
                        <div class="card h-100 shadow-sm"> 
                            <a href="movie.html?id=${movie.imdbID}" class="text-decoration-none text-dark d-block position-relative"> 
                                <img src="${poster}" alt="${movie.Title}" class="card-img-top">
                                <div class="card-body">
                                    <h5 class="card-title mb-0">${movie.Title}</h5>
                                    <p class="card-text">${movie.Year}</p>
                                </div>
                                <div class="card-footer bg-transparent border-top-0 position-absolute bottom-0 start-50 translate-middle-x"> 
                                    <i class="bi bi-heart-fill remove-favorite fs-4" data-movieid="${movie.imdbID
              }" style="cursor: pointer;"></i>
                                </div>
                            </a>
                        </div>
                    `;
            favoritesList.appendChild(movieElement);
          }
        });
        attachRemoveFromFavoritesEventListeners();
      })
      .catch((error) => {
        console.error("Error fetching favorite movies:", error);
        favoritesList.innerHTML =
          '<p class="text-center">Error fetching favorite movies.</p>';
      });
  }

  /**
   * Attaches event listeners to "Remove from Favorites" buttons.
   */
  function attachRemoveFromFavoritesEventListeners() {
    const buttons = document.querySelectorAll(".remove-favorite");
    buttons.forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        const movieId = this.getAttribute("data-movieid");
        storage.removeFavorite(movieId);
        displayFavorites(); // Refresh the favorites list immediately
        updateFavoritesBadge(); // Update the favorites badge after removing
      });
    });
  }

  /**
   * Retrieves the movie ID from the URL query parameters.
   * @returns {string|null} The movie ID if present, otherwise null.
   */
  function getMovieIdFromURL() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get("id");
  }

  /**
 * Displays the details of a specific movie by fetching its details from the API.
 * @param {string} movieId - The ID of the movie to display.
 */
  function displayMovieDetails(movieId) {
    const movieDetailsElement = document.getElementById("movieDetails");

    api.fetchMovieDetails(movieId)
      .then((movie) => {
        if (movie.Response === "True") {
          const poster = movie.Poster !== "N/A" ? movie.Poster : 'https://placehold.co/800?text=No+Poster';
          const favorites = storage.getFavorites();
          const isFavorite = favorites.includes(movie.imdbID);

          movieDetailsElement.innerHTML = `
          <div class="container mt-4">
            <div class="row align-items-center">
              <div class="col-md-4">
                <img src="${poster}" alt="${movie.Title}" class="img-fluid rounded shadow">
              </div>
              <div class="col-md-8">
                <div class="d-flex align-items-center mb-3">
                  <h2 class="mb-0 me-3">${movie.Title}</h2>
                  <button class="heart-icon ${isFavorite ? 'remove-favorite' : 'add-favorite'}" data-movieid="${movie.imdbID}">
                    <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} fs-4"></i>
                  </button>
                </div>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Rated:</strong> ${movie.Rated}</p>
                <p><strong>Released:</strong> ${movie.Released}</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Writer:</strong> ${movie.Writer}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Language:</strong> ${movie.Language}</p>
                <p><strong>Country:</strong> ${movie.Country}</p>
                <p><strong>Awards:</strong> ${movie.Awards}</p>
              </div>
            </div>
          </div>
        `;

          // Attach event listener to the favorite button
          const favButton = movieDetailsElement.querySelector('.add-favorite, .remove-favorite');
          if (favButton) {
            favButton.addEventListener('click', function (event) {
              event.preventDefault();
              const movieId = this.getAttribute('data-movieid');

              if (this.classList.contains('remove-favorite')) {
                // Already favorite, so remove it
                storage.removeFavorite(movieId);
                this.querySelector('i').classList.remove('bi-heart-fill');
                this.querySelector('i').classList.add('bi-heart');
                this.classList.remove('remove-favorite');
                this.classList.add('add-favorite');
              } else {
                // Not a favorite yet, add it
                storage.addFavorite(movieId);
                this.querySelector('i').classList.remove('bi-heart');
                this.querySelector('i').classList.add('bi-heart-fill');
                this.classList.remove('add-favorite');
                this.classList.add('remove-favorite');
              }

              updateFavoritesBadge(); // Update the favorites badge after adding/removing
            });
          }

        } else {
          movieDetailsElement.innerHTML = "Movie details not found.";
        }
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        movieDetailsElement.innerHTML = "Error loading movie details.";
      });
  }


  /**
   * Updates the favorites badge based on the current number of favorites.
   */
  function updateFavoritesBadge() {
    const favorites = storage.getFavorites();
    const favoritesBadge = document.getElementById("favoritesBadge");

    if (favorites.length > 0) {
      favoritesBadge.textContent = favorites.length;
      favoritesBadge.style.display = "inline"; // Show the badge if there are favorites
    } else {
      favoritesBadge.style.display = "none"; // Hide the badge if no favorites
    }
  }

  // Initial call to update the favorites badge on page load
  updateFavoritesBadge();
});

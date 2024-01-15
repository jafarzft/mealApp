document.addEventListener("DOMContentLoaded", () => {
    // Get references to HTML elements
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const favoriteMealsDiv = document.getElementById("favoriteMeals");

    // Call displayFavoriteMeals on page load
    displayFavoriteMeals();

    // Add event listener for search input with debouncing
    searchInput.addEventListener("input", debounce(handleSearch, 300));

    // Function to handle search input
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
                .then(response => response.json())
                .then(data => displaySearchResults(data.meals));
        } else {
            clearSearchResults();
        }
    }

    // Function to display search results
    function displaySearchResults(meals) {
        clearSearchResults();

        meals.forEach(meal => {
            const resultDiv = createResultDiv(meal);
            searchResults.appendChild(resultDiv);
        });
    }

    // Function to add a meal to favorites
    function addToFavorites(mealId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (!favorites.includes(mealId)) {
            favorites.push(mealId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            // alert('Added to Favorites!');
            displayFavoriteMeals();
        } else {
            alert('This meal is already in your Favorites!');
        }
    }

    // Function to create HTML structure for a search result
    function createResultDiv(meal) {
        const resultDiv = document.createElement("div");
        resultDiv.classList.add("result");

        resultDiv.innerHTML = `
            <div class= "mealName">${meal.strMeal}</div>
            <div class="image-container">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="buttons-container">
                    <button class="btn btn-sm btn-info" data-toggle="modal" data-target="#mealDetails" data-meal-id="${meal.idMeal}">View Details</button>
                    <button class="favorite-btn btn-success btn-sm" data-meal-id="${meal.idMeal}" onclick="addToFavorites('${meal.idMeal}')">Add to Favorites</button>
                </div>
            </div>
        `;

        return resultDiv;
    }

    // Function to clear search results
    function clearSearchResults() {
        searchResults.innerHTML = "";
    }

    // Event delegation for "View Details" button
    searchResults.addEventListener("click", (event) => {
        const viewDetailsButton = event.target.closest(".btn-info");
        if (viewDetailsButton) {
            const mealId = viewDetailsButton.getAttribute("data-meal-id");
            displayMealDetails(mealId);
        }
    });

    // Event delegation for "Add to Favorites" button
    searchResults.addEventListener("click", (event) => {
        const addToFavoritesButton = event.target.closest(".favorite-btn");
        if (addToFavoritesButton) {
            const mealId = addToFavoritesButton.getAttribute("data-meal-id");
            addToFavorites(mealId);
        }
    });

    // Function to display favorite meals
    function displayFavoriteMeals() {
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        favoriteMealsDiv.innerHTML = "";

        if (favorites.length === 0) {
            favoriteMealsDiv.innerHTML = "<p>No favorite meals added!</p>";
        } else {
            favorites.forEach(mealId => {
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
                    .then(response => response.json())
                    .then(data => {
                        const meal = data.meals[0];
                        const favoriteMealDiv = createFavoriteResultDiv(meal);
                        favoriteMealDiv.querySelector(".favorite-btn").textContent = "Remove from Favorites";
                        favoriteMealDiv.querySelector(".favorite-btn").onclick = () => removeFromFavorites(mealId);
                        favoriteMealsDiv.appendChild(favoriteMealDiv);
                    })
                    .catch(error => {
                        console.error("Error fetching meal details:", error);
                    });
            });
        }
    }

    // Function to create HTML structure for a favorite meal
    function createFavoriteResultDiv(meal) {
        const resultDiv = document.createElement("div");
        resultDiv.classList.add("result");

        resultDiv.innerHTML = `
            <div class="mealName">${meal.strMeal || 'Unknown'}</div>
            <div class="image-container">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal || 'Unknown'}">
                <div class="buttons-container">
                    <button class="favorite-btn btn-danger btn-sm" data-meal-id="${meal.idMeal}">Add to Favorites</button>
                </div>
            </div>
        `;

        return resultDiv;
    }

    // Function to display meal details in a modal
    function displayMealDetails(mealId) {
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            .then(response => response.json())
            .then(data => {
                const meal = data.meals[0];

                const modalTitle = document.querySelector(".modal-title");
                const modalBody = document.querySelector(".modal-body");

                modalTitle.textContent = meal.strMeal || 'Unknown';

                const mealDetailsHTML = `
                    <div style="text-align: center;"><img src="${meal.strMealThumb} " style="width: 50%; border-radius: 50%; alt="${meal.strMeal || 'Unknown'}" class="img-fluid  ">  </div>  
                    <p>${meal.strInstructions || 'No instructions available.'}</p>
                    <h4>Ingredients:</h4>
                    <ul>
                        ${getIngredientsList(meal)}
                    </ul>
                `;

                modalBody.innerHTML = mealDetailsHTML;

                $('#mealDetailsModal').modal('show');
            })
            .catch(error => {
                console.error("Error fetching meal details:", error);
            });
    }

    // Function to get ingredients list
    function getIngredientsList(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            if (ingredient) {
                ingredients.push(`<li>${ingredient} - ${meal[`strMeasure${i}`]}</li>`);
            }
        }
        return ingredients.join('');
    }

    // Function to remove a meal from favorites
    function removeFromFavorites(mealId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (mealId) {
            // Remove a specific meal from favorites
            favorites = favorites.filter(id => id !== mealId);
        } else {
            // Remove invalid entries (e.g., if meal no longer exists)
            favorites = favorites.filter(id => id);
        }
        // set
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavoriteMeals();
    }

    // Utility function to debounce input events
    function debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
});

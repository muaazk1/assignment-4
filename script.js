/**
 * Name: Mu'aaz Khan
 * Date: 10.14.2026
 * CSC 372-01
 * 
 * This is the script.js file for assignment 4. It fetches data from the TVmaze API and displays information about TV shows 
 * based on user input, displaying them in a gallery format.
 * 
 */
"use strict";

let message = document.getElementById("message");
let gallery = document.getElementById("gallery");
let searchForm = document.getElementById("search-form");
let searchQuery = document.getElementById("search-query");

/**
 * Searches for TV shows based on the search query and displays up to 10 results in the gallery.
 * Shows a message if the search is empty, has no matches, rate limit is reached, or the request fails.
 * @param {string} query - The search query.
 * @returns {Promise<void>} - A promise that resolves when the search is complete.
 */
async function search(query) {
    gallery.replaceChildren();
    query = query.trim();

    if (query === "") {
        message.textContent = "Please enter a show title or keyword.";
        return;
    }

    message.textContent = "Loading...";

    try {
        let response = await fetch("https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(query));
        if (response.status === 429) {
            throw new Error("TVmaze rate limit reached. Please wait a moment and try again.");
        }
        if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
        }

        let results = await response.json();

        if (results.length === 0) {
            message.textContent = "No shows found for \"" + query + "\".";
            return;
        }

        message.textContent = "";

        results.slice(0, 10).forEach(function (result) {
            let cardData = createCard(result.show);
            gallery.appendChild(cardData.card);
            loadCast(result.show.id, cardData.castInfo);
        });
    } catch (error) {
        message.textContent = error.message;
    }
}

/**
 * Gets the cast information for a given show and adds the names to its card.
 * @param {number} showId - The ID of the show for which to load cast information.
 * @param {HTMLElement} castInfo - The HTML element to update with cast information.
 */
async function loadCast(showId, castInfo) {
    try {
        let response = await fetch("https://api.tvmaze.com/shows/" + showId + "/cast");
        if (!response.ok) {
            throw new Error("Cast request failed");
        }
        let cast = await response.json();
        let names = cast.slice(0, 5).map(function (actor) {
            return actor.person.name;
        });
        castInfo.textContent = "Cast: " + (names.length ? names.join(", ") : "Not available");
    } catch (error) {
        castInfo.textContent = "Cast: Not available";
    }
}

/**
 * Creates a card for a TV show using the given data and image if available.
 * @param {Object} show - The show data.
 * @returns {Object} - An object containing the card element and the cast information line.
 */
function createCard(show) {
    let card = document.createElement("article");
    card.className = "card";

    if (show.image && show.image.medium) {
        let img = document.createElement("img");
        img.src = show.image.medium;
        img.alt = show.name + " poster";
        card.appendChild(img);
    }

    let title = document.createElement("h2");
    title.textContent = show.name;
    card.appendChild(title);

    let summary = "Not available";

    if (show.summary) {
        let text = new DOMParser().parseFromString(show.summary, "text/html").body.textContent.trim();
        summary = text.length > 200 ? text.slice(0, 200) + "..." : text;
    }

    let summaryLine = document.createElement("p");
    summaryLine.textContent = "Summary: " + summary;
    card.appendChild(summaryLine);

    let premiered = document.createElement("p");
    premiered.textContent = "Premiered: " + (show.premiered || "Not available");
    card.appendChild(premiered);

    let lastUpdated = document.createElement("p");
    lastUpdated.textContent = "Last updated: " + (show.updated ? new Date(show.updated * 1000).toLocaleString() : "Not available");
    card.appendChild(lastUpdated);

    let genres = document.createElement("p");
    genres.textContent = "Genres: " + (show.genres && show.genres.length ? show.genres.join(", ") : "Not available");
    card.appendChild(genres);

    let rating = document.createElement("p");
    rating.textContent = "Rating: " + (show.rating && show.rating.average ? show.rating.average : "Not available");
    card.appendChild(rating);

    let castInfo = document.createElement("p");
    castInfo.textContent = "Cast: Loading...";
    card.appendChild(castInfo);

    let link = document.createElement("a");
    link.href = show.url;
    link.textContent = "View on TVmaze";
    card.appendChild(link);

    return { card, castInfo };
}

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    search(searchQuery.value);
});

searchQuery.value = "The Office";
search("The Office");
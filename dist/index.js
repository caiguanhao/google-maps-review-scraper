import { SortEnum } from "./types.js";
import { validateParams, paginateReviews } from "./utils.js";
import fetchPlaceData from "./extraction.js";
/**
 * Scrapes reviews from a given Google Maps URL.
 *
 * @param {string} url - The URL of the Google Maps location to scrape reviews from.
 * @param {Object} options - The options for scraping.
 * @param {string} [options.sort_type="relevent"] - The type of sorting for the reviews ("relevent", "newest", "highest_rating", "lowest_rating").
 * @param {string} [options.search_query=""] - The search query to filter reviews.
 * @param {string} [options.pages="max"] - The number of pages to scrape (default is "max"). If set to a number, it will scrape that number of pages (results will be 10 * pages) or until there are no more reviews.
 * @param {boolean} [options.clean=false] - Whether to return clean reviews or not.
 * @returns {Promise<ScraperResult>} - Returns an object with place coordinates and an array of reviews.
 * @throws {Error} - Throws an error if the URL is not provided, invalid, or if fetching reviews fails.
 */
export async function scraper(url, { sort_type = "relevent", search_query = "", pages = "max", clean = false } = {}) {
    try {
        validateParams(url, sort_type, pages, clean);
        const sortValue = SortEnum[sort_type];
        const m = [...url.matchAll(/!1s([a-zA-Z0-9_:]+)!/g)];
        if (!m || !m[0] || !m[0][1]) {
            throw new Error("Invalid URL");
        }
        const placeId = m[1]?.[1] ? m[1][1] : m[0][1];
        const placeData = await fetchPlaceData(url, placeId);
        if (!placeData) {
            throw new Error("Could not fetch place data.");
        }
        await new Promise(r => setTimeout(r, 2000));
        const reviews = await paginateReviews(placeId, sortValue, pages, search_query, clean, placeData.session_token);
        return {
            place: {
                name: placeData.name,
                address: placeData.address,
                coordinates: placeData.coordinates,
                main_photo_url: placeData.main_photo_url,
            },
            reviews: reviews || [],
        };
    }
    catch (e) {
        throw e instanceof Error ? e : new Error(String(e));
    }
}

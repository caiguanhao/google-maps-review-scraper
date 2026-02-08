import type { ScraperResult } from "./types.js";
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
export declare function scraper(url: string, { sort_type, search_query, pages, clean }?: {
    sort_type?: string | undefined;
    search_query?: string | undefined;
    pages?: string | undefined;
    clean?: boolean | undefined;
}): Promise<ScraperResult>;

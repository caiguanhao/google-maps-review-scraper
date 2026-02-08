/**
 * Validates parameters for the Google Maps review scraper.
 * @param {string} url - The URL of the Google Maps location to scrape reviews from.
 * @param {string} sort_type - The type of sorting for the reviews ("relevent", "newest", "highest_rating", "lowest_rating").
 * @param {string | number} pages - The number of pages to scrape (default is "max"). If set to a number, it will scrape that number of pages (results will be 10 * pages) or until there are no more reviews.
 * @param {boolean} clean - Whether to return clean reviews or not.
 */
export declare function validateParams(url: string, sort_type: string, pages: string | number, clean: boolean): void;
/**
 * Fetches and handles the XSSI security prefix.
 * @param {string} placeId - The CID (e.g., 0x3ae2575b18d322ff:0x3c53adf6ab35b12b)
 * @param {1 | 2 | 3 | 4} sort - The type of sorting for the reviews (1: Most Relevant, 2: Newest, 3: Highest Rating, 4: Lowest Rating).
 * @param {string} nextPage - The next page token for pagination.
 * @param {string} search_query - The search query to filter reviews.
 * @param {string} sessionToken - The session token for authentication.
 */
export declare function fetchReviews(placeId: string, sort: 1 | 2 | 3 | 4, nextPage: string | undefined, search_query: string | undefined, sessionToken: string): Promise<any>;
/**
 * Paginates through reviews.
 * @param {string} placeId - The CID (e.g., 0x3ae2575b18d322ff:0x3c53adf6ab35b12b)
 * @param {1 | 2 | 3 | 4} sort - The type of sorting for the reviews (1: Most Relevant, 2: Newest, 3: Highest Rating, 4: Lowest Rating).
 * @param {string | number} pages - The number of pages to scrape (default is "max"). If set to a number, it will scrape that number of pages (results will be 10 * pages) or until there are no more reviews.
 * @param {string} search_query - The search query to filter reviews.
 * @param {boolean} clean - Whether to return clean reviews or not.
 * @param {string} sessionToken - The session token for authentication.
 */
export declare function paginateReviews(placeId: string, sort: 1 | 2 | 3 | 4, pages: string | number, search_query: string, clean: boolean, sessionToken: string): Promise<any[]>;

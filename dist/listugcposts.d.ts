/**
 * Converts a Google Maps place URL to a listugcposts endpoint URL.
 * @param {string} placeId Google Maps Place ID.
 * @param {1|2|3|4} so Sorting order (1: Most Relevant, 2: Newest, 3: Highest Rating, 4: Lowest Rating).
 * @param {string} [pg=""] Base64 encoding of the page number.
 * @param {string} [sq=""] Search query for filtering reviews.
 * @param {string} sessionToken Session token for authentication.
 * @returns {string} URL to fetch reviews.
 * @throws Will throw an error if the URL is invalid.
 */
export default function (placeId: string, so: 1 | 2 | 3 | 4, pg: string | undefined, sq: string | undefined, sessionToken: string): string;

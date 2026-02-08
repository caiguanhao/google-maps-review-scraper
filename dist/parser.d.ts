import type { ParsedReview } from "./types.js";
/**
 * Parses an array of reviews and returns a minified JSON string.
 * @param {any[][]} reviews - Array of review data wrappers.
 * @returns {ParsedReview[]} An array of the parsed reviews.
 */
export default function parseReviews(reviews: any[][]): ParsedReview[];

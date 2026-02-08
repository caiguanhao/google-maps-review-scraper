import type { PlaceData } from "./types.js";
/**
 * Main function to fetch data for a place.
 * Extracts the session token, place coordinates, name, address, and photo from the Google Maps page.
 * @param {string} url - The original Google Maps URL provided by the user.
 * @param {string} placeId - The CID (e.g., 0x3ae2575b18d322ff:0x3c53adf6ab35b12b)
 */
export default function fetchPlaceData(url: string, placeId: string): Promise<PlaceData | null>;

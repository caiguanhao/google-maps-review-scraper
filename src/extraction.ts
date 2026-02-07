import { client } from "./client.js";
import type { PlaceData } from "./types.js";

/**
 * Fetches place details from the Google Maps preview/place endpoint.
 * The endpoint returns rich structured data including name, address, photo, etc.
 * @param {string} previewUrl - The full preview/place URL extracted from the HTML page.
 * @returns Place details or null fields if the fetch fails.
 */
async function fetchPlaceDetails(previewUrl: string) {
    let name: string | null = null;
    let address: string | null = null;
    let main_photo_url: string | null = null;

    try {
        const res = await client.fetch(previewUrl);
        const text = await res.text();
        const jsonStr = text.includes(")]}'") ? text.split(")]}'")[1] : text;
        if (!jsonStr) return { name, address, main_photo_url };

        const data = JSON.parse(jsonStr) as any[];
        const place = data[6];
        if (!Array.isArray(place)) return { name, address, main_photo_url };

        // data[6][11]: Place name
        if (typeof place[11] === "string") {
            name = place[11];
        }

        // data[6][39]: Full formatted address
        if (typeof place[39] === "string") {
            address = place[39];
        }

        // data[6][72][0][0][0]: Main photo ID → construct Google Photos URL
        const photoId = place[72]?.[0]?.[0]?.[0];
        if (typeof photoId === "string" && photoId.startsWith("AF1Qip")) {
            main_photo_url = `https://lh5.googleusercontent.com/p/${photoId}=w600-h400-k-no`;
        }
    } catch {
        // Best-effort: return whatever we have
    }

    return { name, address, main_photo_url };
}

/**
 * Main function to fetch data for a place.
 * Extracts the session token, place coordinates, name, address, and photo from the Google Maps page.
 * @param {string} url - The original Google Maps URL provided by the user.
 * @param {string} placeId - The CID (e.g., 0x3ae2575b18d322ff:0x3c53adf6ab35b12b)
 */
export default async function fetchPlaceData(url: string, placeId: string): Promise<PlaceData | null> {
    try {
        // Fetch the page using the original URL for richer embedded data
        const sourceUrl = url;
        const sourceRes = await client.fetch(sourceUrl);
        const html = await sourceRes.text();

        // Grab the kEI token using the fast split method
        const token = html.split("var kEI='")[1]?.split("'")[0];
        if (!token) throw new Error("Could not find session token (kEI) in source.");

        // Extract place coordinates from the page
        // Google Maps pages embed /@lat,lng, in various URLs within the HTML
        let coordinates: { lat: number; lng: number } | null = null;
        const coordMatch = html.match(/@(-?\d+\.\d+),(-?\d+\.\d+),/);
        if (coordMatch && coordMatch[1] && coordMatch[2]) {
            coordinates = {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2]),
            };
        }

        // Extract place details (name, address, photo) from the preview/place endpoint
        // The HTML contains a <link> tag with the preview/place URL and its pb parameter
        let name: string | null = null;
        let address: string | null = null;
        let main_photo_url: string | null = null;

        const previewLinkMatch = html.match(/<link\s+href="(\/maps\/preview\/place\?[^"]+)"/i);
        if (previewLinkMatch) {
            const previewUrl = "https://www.google.com" + previewLinkMatch[1]!.replace(/&amp;/g, "&");
            const details = await fetchPlaceDetails(previewUrl);
            name = details.name;
            address = details.address;
            main_photo_url = details.main_photo_url;
        }

        // Fallback: try to extract name from embedded JS data if preview/place didn't work
        if (!name) {
            const cidEscaped = placeId.replace(/([.*+?^${}()|[\]\\:\/])/g, "\\$1");
            const embeddedMatch = html.match(new RegExp(`\\["${cidEscaped}","([^"]+)"`));
            if (embeddedMatch) {
                name = embeddedMatch[1] ?? null;
            }
        }

        return { session_token: token, coordinates, name, address, main_photo_url };
    } catch (error) {
        console.error("[-] Fetch error:", (error as Error).message);
        return null;
    }
}

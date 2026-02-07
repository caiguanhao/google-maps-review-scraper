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
    let coordinates: { lat: number; lng: number } | null = null;

    try {
        const res = await client.fetch(previewUrl);
        const text = await res.text();
        const jsonStr = text.includes(")]}'") ? text.split(")]}'")[1] : text;
        if (!jsonStr) return { name, address, main_photo_url, coordinates };

        const data = JSON.parse(jsonStr) as any[];
        const place = data[6];
        if (!Array.isArray(place)) return { name, address, main_photo_url, coordinates };

        // data[6][11]: Place name
        if (typeof place[11] === "string") {
            name = place[11];
        }

        // data[6][39]: Full formatted address
        if (typeof place[39] === "string") {
            address = place[39];
        }

        // Extract main photo URL from photo data
        // The photo URL is embedded somewhere in the place[72] structure.
        // Search for a googleusercontent URL directly instead of constructing one.
        if (Array.isArray(place[72])) {
            const photoStr = JSON.stringify(place[72]);
            const urlMatch = photoStr.match(/https?:\/\/lh\d+\.googleusercontent\.com\/[^"\\]+/);
            if (urlMatch) {
                // Remove size params (e.g. =w408-h544-k-no) to get the original size
                main_photo_url = urlMatch[0].replace(/=w\d+-h\d+-k-no$/, "");
            }
        }
        // data[6][9]: Coordinates array — [null, null, lat, lng]
        if (Array.isArray(place[9]) && typeof place[9][2] === "number" && typeof place[9][3] === "number") {
            coordinates = {
                lat: Math.round(place[9][2] * 1e6) / 1e6,
                lng: Math.round(place[9][3] * 1e6) / 1e6,
            };
        }
    } catch {
        // Best-effort: return whatever we have
    }

    return { name, address, main_photo_url, coordinates };
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

        // Extract place marker coordinates from the page
        // Google Maps encodes the actual place coordinates as !3d<lat>!4d<lng> in data URLs
        let coordinates: { lat: number; lng: number } | null = null;
        const coordMatch = html.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (coordMatch && coordMatch[1] && coordMatch[2]) {
            coordinates = {
                lat: Math.round(parseFloat(coordMatch[1]) * 1e6) / 1e6,
                lng: Math.round(parseFloat(coordMatch[2]) * 1e6) / 1e6,
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
            // Prefer structured API coordinates over regex fallback
            if (details.coordinates) {
                coordinates = details.coordinates;
            }
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

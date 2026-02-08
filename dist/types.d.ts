export declare enum SortEnum {
    "relevent" = 1,
    "newest" = 2,
    "highest_rating" = 3,
    "lowest_rating" = 4
}
export interface PlaceCoordinates {
    lat: number;
    lng: number;
}
export interface PlaceData {
    session_token: string;
    coordinates: PlaceCoordinates | null;
    name: string | null;
    address: string | null;
    main_photo_url: string | null;
}
export interface ScraperResult {
    place: {
        name: string | null;
        address: string | null;
        coordinates: PlaceCoordinates | null;
        main_photo_url: string | null;
    };
    reviews: ParsedReview[] | any[];
}
export interface ParsedReview {
    review_id: string;
    time: {
        published: any;
        last_edited: any;
    };
    author: {
        name: string;
        profile_url: string;
        url: string;
        id: string;
    };
    review: {
        rating: number;
        text: string | null;
        language: string | null;
    };
    images: Array<{
        id: string;
        url: string;
        size: {
            width: number;
            height: number;
        };
        location: {
            friendly?: string;
            lat: number;
            long: number;
        };
        caption: string | null;
    }> | null;
    source: string;
    response: {
        text: string | null;
        time: {
            published: any;
            last_edited: any;
        };
    } | null;
}

export class MediaImdbSetRequest {    
    mediaDocumentId: string;
    imdbId: string;
}

export class MediaImdbSetResponse {
    success: boolean;
    imdbId: string;
}
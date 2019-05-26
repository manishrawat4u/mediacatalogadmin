export class Media {
    _id?: string;
  ts: Date;
  source: string;  
  mediaDocument: {
    name: string;
    mimeType: string;
    id: string;
    kind: string;
    originalFilename: string;
    size: string;
    md5Checksum: string;
    videoMediaMetadata:{
        width: number;
        height: number;
        durationMillis: number;
    }
  }
}

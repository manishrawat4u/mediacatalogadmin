import { Injectable } from '@angular/core';
import { Media } from './media';
import { HttpClient } from '@angular/common/http';
import { PagedList } from '../paged.list';
import { MediaImdbSetRequest, MediaImdbSetResponse } from '../models/MediaImdbSetRequest';

@Injectable()
export class MediaService {
  private mediasUrl = '/api/medias';

  constructor(private http: HttpClient) { }

  // get("/api/contacts")
  getMedias(next: number, limit: number, query: string): Promise<void | PagedList<Media>> {
    return this.http.get(this.mediasUrl, {
      params: {
        limit: limit.toString(),
        next: next.toString(),
        q: query
      }})
      .toPromise()
      .then(response => response as PagedList<Media>)
      .catch(this.handleError);
  }

  //post("/api/contacts")
  setImdb(newContact: MediaImdbSetRequest): Promise<void | MediaImdbSetResponse> {
    var putUrl = this.mediasUrl + '/' + newContact.mediaDocumentId + '/imdb';
    return this.http.post(putUrl, newContact)
               .toPromise()               
               .then(response=> response as MediaImdbSetResponse)
               .catch(this.handleError);
  }

  // get("/api/contacts/:id") endpoint not used by Angular app

  // delete("/api/medias/:id")
  // deleteContact(delContactId: String): Promise<void | String> {
  //   return this.http.delete(this.contactsUrl + '/' + delContactId)
  //              .toPromise()
  //              .then(response => response.json() as String)
  //              .catch(this.handleError);
  // }

  // // put("/api/medias/:id")
  // updateContact(putContact: Media): Promise<void | Media> {
  //   var putUrl = this.contactsUrl + '/' + putContact._id;
  //   return this.http.put(putUrl, putContact)
  //              .toPromise()
  //              .then(response => response.json() as Media)
  //              .catch(this.handleError);
  // }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
  }
}
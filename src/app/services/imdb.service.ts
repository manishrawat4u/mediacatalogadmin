import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImdbMediaInfo } from '../models/imdb';

@Injectable({
  providedIn: 'root'
})
export class ImdbService {

  private imdbUrl = '/api/imdb';


  constructor(private http: HttpClient) { }
  
  search(query: string): Promise<void | ImdbMediaInfo[]> {

    return this.http.get(this.imdbUrl, {
      params: {
        q: query
      }})
      .toPromise()
      .then(response => response as ImdbMediaInfo[])
      .catch(this.handleError);
  }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
  }
}

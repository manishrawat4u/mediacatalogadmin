import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ImdbService } from '../services/imdb.service';
import { MatAutocomplete, MatInput, MatFormField, MatFormFieldControl } from '@angular/material';
import { SearchBoxComponent } from '../search-box.component';

import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { ImdbMediaInfo } from '../models/imdb';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-imdb-info',
  templateUrl: './imdb-info.component.html',
  styleUrls: ['./imdb-info.component.scss']
})
export class ImdbInfoComponent implements OnInit {
  @ViewChild(MatInput) searchTextBox: MatInput;
  @ViewChild(MatFormField) txt: MatFormField;
  @ViewChild(MatFormFieldControl) t: MatFormFieldControl<Text>;
  // @ViewChild(SearchBoxComponent) search: SearchBoxComponent;
  options: ImdbMediaInfo[] = [];
  exampleForm: FormGroup;
  
ngOnInit(){
  this.exampleForm = this.formBuilder.group({    
    q: ['']
  });

  merge(this.exampleForm.controls['q'].valueChanges)
      .pipe(
        debounceTime(400),
        startWith({}),
        switchMap(() => {
          //this.isLoadingResults = true;
          
          return this.imdbService.search(this.exampleForm.controls['q'].value);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          // this.isLoadingResults = false;
          // this.pageNo = (data as PagedList<Media>).pageNo;
          // this.paginator.length = (data as PagedList<Media>).totalCount;
          return data;
        }),
        catchError(() => {
          //this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => this.options = data as ImdbMediaInfo[]);
}

  ngAfterViewInit(): void {
    
    
    
  }

  constructor(private formBuilder: FormBuilder, 
    private imdbService: ImdbService) { }
}

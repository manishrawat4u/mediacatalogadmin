import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { ImdbService } from '../../services/imdb.service';
import { MatAutocomplete, MatInput, MatFormField, MatFormFieldControl } from '@angular/material';

import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime, finalize, distinctUntilChanged } from 'rxjs/operators';
import { ImdbMediaInfo } from '../../models/imdb';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-imdb-info',
  templateUrl: './imdb-info.component.html',
  styleUrls: ['./imdb-info.component.scss']
})
export class ImdbInfoComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {

  }
  @ViewChild(MatAutocomplete) autoCompleted: MatAutocomplete;
  @Output() selectedItemChanges = new EventEmitter();
  @Input() title: string;
  @Input() searchBarIconName: string;
  options: ImdbMediaInfo[] = [];
  exampleForm: FormGroup;


  selectedMediaItem: ImdbMediaInfo;
  selectedTitle: string;
  selectedImdbId: string;
  isLoading: boolean = false;

  displayFn(mediaInfo?: any): string | undefined {
    return mediaInfo ? (mediaInfo.title || mediaInfo) : undefined;
  }

  ngOnInit() {
    //optimization needed
    // debugger;
    this.exampleForm = this.formBuilder.group({
      q: ['']
    });

    this.autoCompleted.optionSelected.pipe().subscribe(data => {
      this.selectedMediaItem = data.option.value as ImdbMediaInfo;
      this.selectedItemChanges.emit();
    });

    if (this.title) {
      this.exampleForm.controls['q'].setValue(this.title);
    }

    merge(this.exampleForm.controls['q'].valueChanges)
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        //startWith(this.title),
        switchMap((v,x) => {
          this.isLoading = true;
          return this.imdbService.search(v);
          
          //this.isLoadingResults = true;
          this.isLoading = true;
          var _q = (this.exampleForm.controls['q'].value);
          if (_q) {
            return this.imdbService.search(_q);            
          } else {
            return observableOf<ImdbMediaInfo[]>([]);
          }
        }),
        catchError(() => {
          //this.isLoadingResults = false;          
          return observableOf([]);
        })
      ).subscribe((data: ImdbMediaInfo[]) => { this.isLoading = false; this.options = data });
  }

  onSearchElementFucus() {

  }

  constructor(private formBuilder: FormBuilder,
    private imdbService: ImdbService) { }
}

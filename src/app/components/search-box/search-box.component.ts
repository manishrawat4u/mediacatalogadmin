import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
  exampleForm: FormGroup;

  @Input() inputModel: string;
  @Output()
  search = new EventEmitter();
  lastSearch = "";

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.exampleForm = this.formBuilder.group({
      q: ['']
    });

    merge(this.exampleForm.controls['q'].valueChanges)
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
      ).subscribe(val => {
        if (this.lastSearch != val) {
          this.lastSearch = val;
          this.inputModel = val;
          this.search.emit(val);
        }
      });
  }
}

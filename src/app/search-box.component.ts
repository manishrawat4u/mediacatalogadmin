import { Component, Input, EventEmitter, Output, ViewChild, AfterViewInit, OnInit, ElementRef, SimpleChanges } from "@angular/core";
import { MatInput } from '@angular/material';
import { Observable } from 'rxjs'
import { fromEvent, timer } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

declare const module;

@Component({
    selector: 'search-box',
    moduleId: module.id,
    templateUrl: 'search-box.component.html',
    styleUrls: ['search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
    el;
    constructor(element: ElementRef) {
        this.el = element;
    }
    @Input() inputModel: string;
    @Output()
    search = new EventEmitter();
    lastSearch = "";
    ngOnInit(): void {
        var ofs = this.el.nativeElement as Element;
        var nativeSearchElement = ofs.getElementsByTagName('input');
        this.lastSearch = nativeSearchElement[0].value;
        /**
        * Observable.fromEvent :
        * To prevent call on each keyup event , this will wait for 200ms while user 
        * will be typing , just to reduce load over server and to reduce api calls
        */
        const example = fromEvent(nativeSearchElement, 'keyup').pipe(map(i => (<HTMLTextAreaElement>i.currentTarget).value));;

        // //wait .5s between keyups to emit current value
        // //throw away all other values
        const debouncedInput = example.pipe(debounceTime(400));

        // //log values
        const subscribe = debouncedInput.subscribe(val => {
            if (this.lastSearch != val){
                this.lastSearch = val;
                console.log(`Debounced Input: ${val}`);
                this.inputModel = val;
                this.search.emit(val);
            }
        });

    }
}
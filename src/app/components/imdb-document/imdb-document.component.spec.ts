import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImdbDocumentComponent } from './imdb-document.component';

describe('ImdbDocumentComponent', () => {
  let component: ImdbDocumentComponent;
  let fixture: ComponentFixture<ImdbDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImdbDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImdbDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

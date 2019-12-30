import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImdbInfoComponent } from './imdb-info.component';

describe('ImdbInfoComponent', () => {
  let component: ImdbInfoComponent;
  let fixture: ComponentFixture<ImdbInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImdbInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImdbInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

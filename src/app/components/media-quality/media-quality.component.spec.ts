import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaQualityComponent } from './media-quality.component';

describe('MediaQualityComponent', () => {
  let component: MediaQualityComponent;
  let fixture: ComponentFixture<MediaQualityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaQualityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

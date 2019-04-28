import { TestBed } from '@angular/core/testing';

import { ImdbService } from './imdb.service';

describe('ImdbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImdbService = TestBed.get(ImdbService);
    expect(service).toBeTruthy();
  });
});

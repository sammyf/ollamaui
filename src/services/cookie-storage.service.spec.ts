import { TestBed } from '@angular/core/testing';

import { CookieStorageService } from './cookie-storage.service';

describe('LocalStorageService', () => {
  let service: CookieStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

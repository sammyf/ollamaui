import { TestBed } from '@angular/core/testing';

import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct username', () => {
    expect(service.GetUsername()).toBe('user1');
  });

  it( 'should set the username correctly', () => {
    const username = 'user2';
    service.SetUsername(username);
    expect(service.GetUsername()).toBe('user2');
  });

  it( 'should clear the username correctly', () => {
    const username = 'user2';
    service.SetUsername(username);
    service.ClearUsername();
    expect(service.GetUsername()).toBe('');
  });

});

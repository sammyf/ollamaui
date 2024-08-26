import { TestBed } from '@angular/core/testing';
import { UtilsService } from './utils.service';
import {HttpClient, provideHttpClient} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {provideHttpClientTesting} from "@angular/common/http/testing";


describe('UtilsService', () => {
  let service: UtilsService;


  beforeEach(() => {
    TestBed.configureTestingModule({    providers: [
        provideHttpClient(),
        provideAnimationsAsync(),
        provideHttpClientTesting()
      ]});
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct username', () => {
    expect(service.GetUsername()).toBe('user1');
  });

  it('should set the username correctly', () => {
    const username = 'user2';
    service.SetUsername(username);
    expect(service.GetUsername()).toBe('user2');
  });

  it('should clear the username correctly', () => {
    const username = 'user2';
    service.SetUsername(username);
    service.ClearUsername();
    expect(service.GetUsername()).toBe('');
  });

  it('should return a prompt when ::fetch is found in the text', async () => {
    const text = '::fetch https://example.com';
    const result = await service.LookForCommands(text);
    expect(result).toBe(`Here is the content of the URL you requested : <URLCONTENT>\n`);
  });

  it('should return a prompt when ::search is found in the text', async () => {
    const text = '::search `query here`';
    const result = await service.LookForCommands(text);
    expect(result).toBe(`Here are the results of the search for "query here" you requested.\n<LINKED>Search Results</LINKED>\n`);
  });

  it('should return an empty string when no ::fetch or ::search is found in the text', async () => {
    const text = 'Hello World!';
    const result = await service.LookForCommands(text);
    expect(result).toBe('');
  });
});


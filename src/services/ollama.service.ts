import { Injectable, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Answer,
  LLMAnswer,
  Model,
  Models,
} from '../models/ollama.models';
import { CookieStorageService } from './cookie-storage.service';
import { lastValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OllamaService {

  constructor(
    private http: HttpClient,
    private cookieStorage: CookieStorageService
  ) {}
  url: string = `${environment.serverUrl}/api`;

  async getModels(): Promise<Array<Model>> {
    //let models:Models = JSON.parse(this.fakeJson);

    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'encoding': 'utf-8',
    });

    try {
      const models = await lastValueFrom(
        this.http.get<Models>(
          `${this.url}/tags?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            responseType: 'json',
            headers:headers,
          }
        )
      );
      return models.models;
    } catch (error) {
      console.error(error);
      return new Array<Model>();
    }
  }

async getAnswer({ postData }: Answer): Promise<string | undefined> {
  try {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'encoding': 'utf-8',
    });

    const response = await lastValueFrom(
      this.http.post<LLMAnswer>(
        `${this.url}/chat?cache=${Math.floor(Math.random() * 10000000)}`,
        postData,
        {
          responseType: 'json',
          headers:headers
        }
      ).pipe(
        timeout(300000) // sets timeout to 300000ms (5 minutes)
      )
    );

    // @ts-ignore
    return response.message.content;
  } catch (error) {
    console.error(error);
    return 'No Answer.';
  }
}
}

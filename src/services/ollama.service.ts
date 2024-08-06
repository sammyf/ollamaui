import {Injectable, model, NgModule, Renderer2} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders, provideHttpClient, withInterceptors} from '@angular/common/http';
import {
  Answer,
  LLMAnswer,
  Model,
  Models, Prompt, PsModelsData,
} from '../models/ollama.models';
import {CookieStorageService} from './cookie-storage.service';
import {lastValueFrom} from 'rxjs';
import {timeout} from 'rxjs/operators';
import {environment} from '../environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {increaseTimeoutInterceptor} from '../interceptors/httpInterceptor';
import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "../app/app.component";

bootstrapApplication(AppComponent,
  {providers: [  provideHttpClient(    withInterceptors([increaseTimeoutInterceptor]),  )]
  });

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  constructor(
    private http: HttpClient,
  ) {
  }

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
            headers: headers,
          }
        )
      );
      return models.models;
    } catch (error) {
      console.error(error);
      return new Array<Model>();
    }
  }

  async getAnswer({postData}: Answer): Promise<string | undefined> {
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
            headers: headers
          }
        ) .pipe(timeout(600000))
      );

      // @ts-ignore
      return response.message.content;
    } catch (error) {
      console.error(error);
      console.log('There was an error while getAnswer');
      return this.getAnswer({postData});
    }
  }

  async GetCurrentModel():Promise<string> {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'encoding': 'utf-8',
    });

    try {
      const modelsData = await lastValueFrom(
        this.http.get<PsModelsData>(
          `${this.url}/ps?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            responseType: 'json',
            headers: headers,
          }
        )
      );
      if(modelsData.models.length > 0) {
        return modelsData.models[0].name;
      }
      return "None";
    } catch (error) {
      console.error(error);
      return "None";
    }
  }

  async UnloadModel(modelName: string){
    let postData: Prompt = {
      "model": modelName,
      "stream": false,
      "temperature": 1,
      "messages": [],
      "keep_alive": 0
    };
    await this.getAnswer({postData});
    return;
  }
}

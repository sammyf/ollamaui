import {Injectable, model, NgModule, Renderer2} from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders, provideHttpClient, withInterceptors} from '@angular/common/http';
import {
  Answer,
  LLMAnswer, Messages,
  Model,
  Models, Prompt, PsModelsData,
} from '../models/ollama.models';
import {firstValueFrom, lastValueFrom} from 'rxjs';
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
          `${environment.companionUrl}/companion/tags?cache=${Math.floor(Math.random() * 10000000)}`,
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

  //
  // Prompting Ollama must be done via a queue, to avoid CloudFlare timeouts (returncode 524)
  //
  async sendRequest({postData}: Answer): Promise<string | undefined> {
    try {
      const headers = new HttpHeaders({
        'content-type': 'application/json',
        'encoding': 'utf-8',
      });
      const requestId: {uniqueID:string} = await lastValueFrom(
        this.http.post<{uniqueID:string}>(
          `${environment.companionUrl}/async/chat?cache=${Math.floor(Math.random() * 10000000)}`,
          postData,
          {
            responseType: 'json',
            headers: headers
          }
        ) .pipe(timeout(50000))
      );
      console.log("requestId",requestId.uniqueID);
      // @ts-ignore
      return this.waitForAnswer(requestId.uniqueID);
    } catch (error) {
      console.error(error);
      console.log('There was an error while sending the Request');
      return "Error";
    }
  }

  async waitForAnswer(uuid: string) {
    try {
      const headers = new HttpHeaders({
        'content-type': 'application/json',
        'encoding': 'utf-8',
      });
      let response: LLMAnswer
      do {
        response = await lastValueFrom(
          this.http.get<LLMAnswer>(
            `${environment.companionUrl}/companion/response/${uuid}`,
            {
              responseType: 'json',
              headers: headers
            }
          ).pipe(timeout(50000))
        );
        if (response.model === "still processing") {
          await new Promise(resolve => setTimeout(resolve, 5000)); // sleep for 5 seconds
        }
      } while (response.model === "still processing");
      return response.message.content;
    } catch (error) {
      console.error(error);
      console.log('There was an error while sending the Request');
      return "Error 2";
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
          `${environment.companionUrl}/companion/ps?cache=${Math.floor(Math.random() * 10000000)}`,
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
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'encoding': 'utf-8',
    });

    try {
        this.http.post<any>(
          `${environment.companionUrl}/companion/unload?cache=${Math.floor(Math.random() * 10000000)}`,
          postData,
          {
            responseType: 'json',
            headers: headers,
          }
        )
      return;
    } catch (error) {
      console.error(error);
      return;
    }
    return;
  }
}

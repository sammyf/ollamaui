import { Injectable, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {TtsRequest, TtsResponse, UrlRequest, UrlResponse} from "../models/tts.models";
import {lastValueFrom} from "rxjs";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  constructor(private http: HttpClient) {
  }
  url: string = `${environment.serverUrl}/companion`;

  async getTTS(text:string, voice:string):Promise<string> {
    let ttsRequest:TtsRequest = {
    text:text,
    voice:voice
    }
    try{
    const response:TtsResponse = await lastValueFrom(
      this.http.post<TtsResponse>(
        `${this.url}/tts/generate?cache=${Math.floor(Math.random() * 10000000)}`,
        ttsRequest,
        {
          responseType: 'json',
        }
      )
    );
      // @ts-ignore
      return this.url+"/tts/output/"+response.url;
    } catch (error) {
      console.error(error);
      return 'No TTS Answer.';
    }
  }

  async  fetchUrl(text:string):Promise<UrlResponse> {
    let urlRequest:UrlRequest = {
      url:text
    }
    try{
      let response:UrlResponse =  await lastValueFrom(
        this.http.post<UrlResponse>(
          `${this.url}/spider?cache=${Math.floor(Math.random() * 10000000)}`,
          urlRequest,
          {
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return response;
    } catch (error) {
      console.error(error);
      let rs = new UrlResponse();
      rs.content = "An error occurred while fetching url.";
      rs.returnCode = 500;
      return rs;
    }
  }
}

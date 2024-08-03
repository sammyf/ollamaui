import { Injectable, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {TtsRequest, TtsResponse} from "../models/tts.models";
import {lastValueFrom} from "rxjs";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  constructor(private http: HttpClient) {
  }
  url: string = `${environment.serverUrl}/companion/tts`;

  async getTTS(text:string, voice:string):Promise<string> {
    let ttsRequest:TtsRequest = {
    text:text,
    voice:voice
    }
    try{
    const response:TtsResponse = await lastValueFrom(
      this.http.post<TtsResponse>(
        `${this.url}/generate?cache=${Math.floor(Math.random() * 10000000)}`,
        ttsRequest,
        {
          responseType: 'json',
        }
      )
    );
      // @ts-ignore
      return this.url+"/output/"+response.url;
    } catch (error) {
      console.error(error);
      return 'No TTS Answer.';
    }
  }
}

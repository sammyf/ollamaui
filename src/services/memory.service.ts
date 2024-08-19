import { Injectable } from '@angular/core';
import {UrlRequest, UrlResponse} from "../models/tts.models";
import {lastValueFrom} from "rxjs";
import {environment} from "../environments/environment.prod";
import {Memories, Messages} from "../models/ollama.models";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Message} from "nx/src/daemon/client/daemon-socket-messenger";

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  url:string = `${environment.companionUrl}`;
  constructor(private http: HttpClient) {
  }

  async StoreChatLog(csrfToken:string, msg:Messages) {
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', csrfToken);
    let chatMessage = {
      index: -1,
      persona:msg.persona,
      role:msg.role,
      content:msg.content.replace(new RegExp(`<LINKED>.*?</LINKED>`, 'g'), '')
    }
    try{
      let response:UrlResponse =  await lastValueFrom(
        this.http.post<UrlResponse>(
          `${environment.companionUrl}/async/storeChatLog?cache=${Math.floor(Math.random() * 10000000)}`,
          chatMessage,
          {
            headers: headers,
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async ReadChatLog(csrfToken:string):Promise<Array<Messages>> {
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', csrfToken);
    try{
      let response:Array<Messages> =  await lastValueFrom(
        this.http.get<Array<Messages>>(
          `${environment.companionUrl}/async/getChatLog?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            headers: headers,
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }


  async ReadMemories(csrfToken:string):Promise<Array<Memories>> {
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', csrfToken);
    try{
      let response:Array<Memories> =  await lastValueFrom(
        this.http.get<Array<Memories>>(
          `${environment.companionUrl}/async/readMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            headers: headers,
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async GenerateMemories(csrfToken:string):Promise<void> {
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', csrfToken);
    try{
      await lastValueFrom(
        this.http.get<void>(
          `${environment.companionUrl}/async/generateMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            headers: headers,
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async ClearAllChatEntry(csrfToken:string):Promise<void> {
    const headers = new HttpHeaders().set('X-CSRF-TOKEN', csrfToken);
    try{
      let response:void =  await lastValueFrom(
        this.http.get<void>(
          `${environment.companionUrl}/async/clearAllMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            headers: headers,
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}

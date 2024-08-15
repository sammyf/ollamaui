import { Injectable } from '@angular/core';
import {UrlRequest, UrlResponse} from "../models/tts.models";
import {lastValueFrom} from "rxjs";
import {environment} from "../environments/environment.prod";
import {Memories, Messages} from "../models/ollama.models";
import {HttpClient} from "@angular/common/http";
import {Message} from "nx/src/daemon/client/daemon-socket-messenger";

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  url:string;
  constructor(private http: HttpClient) {
    this.url = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
  }

  async StoreChatLog(msg:Messages) {
    let chatMessage = {
      index: -1,
      persona:msg.persona,
      role:msg.role,
      content:msg.content
    }
    try{
      let response:UrlResponse =  await lastValueFrom(
        this.http.post<UrlResponse>(
          `${environment.companionUrl}/async/storeChatLog?cache=${Math.floor(Math.random() * 10000000)}`,
          chatMessage,
          {
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

  async ReadChatLog():Promise<Array<Messages>> {
    try{
      let response:Array<Messages> =  await lastValueFrom(
        this.http.get<Array<Messages>>(
          `${environment.companionUrl}/async/readChatLog?cache=${Math.floor(Math.random() * 10000000)}`,
          {
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


  async ReadMemories():Promise<Array<Memories>> {
    try{
      let response:Array<Memories> =  await lastValueFrom(
        this.http.get<Array<Memories>>(
          `${environment.companionUrl}/async/readMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
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

  async GenerateMemories():Promise<void> {
    try{
      await lastValueFrom(
        this.http.get<void>(
          `${environment.companionUrl}/async/generateMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
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

  async ClearAllChatEntry():Promise<void> {
    try{
      let response:void =  await lastValueFrom(
        this.http.get<void>(
          `${environment.companionUrl}/async/clearAllMemories?cache=${Math.floor(Math.random() * 10000000)}`,
          {
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

import { Injectable } from '@angular/core';
import hljs from "highlight.js";
import {UrlRequest, UrlResponse} from "../models/tts.models";
import {TtsService} from "./tts.service";

const MAX_TOKENS: number = 1000;

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(private ttsService: TtsService) {
  }

  GetTimeDate():string {
    let dateOb = new Date();

    let date = ("0" + dateOb.getDate()).slice(-2);
    let month = ("0" + (dateOb.getMonth() + 1)).slice(-2);
    let year = dateOb.getFullYear();
    let hours = ("0" + dateOb.getHours()).slice(-2);
    let minutes = ("0" + dateOb.getMinutes()).slice(-2);
    let seconds = ("0" + dateOb.getSeconds()).slice(-2);

    return `[${year}-${month}-${date} ${hours}:${minutes}:${seconds}] `;
  }

  //
  // Highlight
  //

  DoHighlight( answer:string):string {
    let originalAnswer = answer;
    // Define a pattern that matches any sequence within ``` ```
    const pattern = /.*?```([a-zA-Z0-9\-]*)\n([\s\S]*?)```/gm;
    let parts = [];
    let matches = originalAnswer.matchAll(pattern);
    for (const match of matches) {
      const l = match[1]
      const g = match[2];
        let highlighted: string;
        highlighted = hljs.highlight(
          g,
          { language: l }).value;
        // Replacing original with highlighted one
        originalAnswer = originalAnswer.replace(g, highlighted);
      }
    return originalAnswer;
  }

  // Internet Connection
  //

  async ReplaceUrls(source:string):Promise<string> {
    let urlRegex: RegExp = /(https?:\/\/[^\s]+)/gi; // This is a regular expression that matches URLs.
    let result: UrlResponse;
    let urls = Array.from(source.matchAll(urlRegex));
    console.log("Number of URLs found: ", urls.length);
    for (let match of urls) {
      let url = match[1];
      console.log(`matched URL : =${url}`);
      let body = await this.ttsService.fetchUrl(url);
      let result = `<LINKED url="${url}" ReturnCode="${body.returnCode}">${body.content}</LINKED>`;
      source = source.replace(url, this.TruncateToTokens(result,MAX_TOKENS));
    };
    return source; // This fetches the URL data and replaces the original URL with it wrapped in "<LINKED URL>{{FetchUrl(URL)}}</LINKED URL>" format.
  }

  TruncateToTokens(input: string, maxTokens:number): string {
    // Split the input based on spaces and punctuation
    let splitInput = input.split(/[\s.,;:"!?]+/);

    // If the length is more than maxTokens, truncate it
    if (splitInput.length > maxTokens) {
      splitInput = splitInput.slice(0, maxTokens);
    }

    // Join the array back into a string and return it
    return splitInput.join(' ')+" [...]";
  }

  //
  // Username Management
  //

  username:string="";

  GetUsername(): string {
    return this.username;
  }

  SetUsername(username:string): void {
    this.username = username;
  }

  ClearUsername(): void {
    this.username = "";
  }
}

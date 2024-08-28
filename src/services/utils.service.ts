import {Injectable, input} from '@angular/core';
import hljs from "highlight.js";
import {UrlRequest, UrlResponse} from "../models/tts.models";
import {TtsService} from "./tts.service";
import {LocalStorageService} from "./local-storage.service";
import {InputBoxComponent} from "../app/inputbox/inputbox.component";
import {lastValueFrom} from "rxjs";
import {environment} from "../environments/environment.prod";
import {HttpClient} from "@angular/common/http";
import {QueryRequest} from "../models/ollama.models";

const MAX_TOKENS: number = 1000;

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor(private http: HttpClient,
              private localStorage: LocalStorageService,) {
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

  // Commands and Internet Connection
  //
  GetCommandPrompt():string {
    let tools = "These tools are available to you. You can use them autonomously without any intervention by the User :\n";
    let fetch ="**::fetch** : The `::fetch` tool is now enabled for autonomous use. Simply type ::fetch followed by the desired URL (without any brackets or quotes) to fetch webpage content. I'll take care of retrieving the information for you.\n";
    let search="**::search** : This tool allows you to search the internet using your favorite search engine, just like you would on a web browser." +
      "To use the ::search tool, simply type `::search` followed by the query you want to search for, enclosed in backticks (`). For example, if you wanted to search for information about 'LLM' and 'Code Companion', you would type ::search `LLM Code Companion`" +
      "The `::search` tool is a powerful way to explore the internet and find answers to your questions. Just remember to enclose your query in backticks (`) and you're good to go!\n";
    return tools+fetch+search;
  }

  async  LookForCommands(text:string):Promise<string> {
    // Regular expression to check for ::fetch followed by a URL
    const fetchRegEx = /::fetch\s*((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/(\w#!:.?\+=&%@!\-\/\]])])?)/i;
    let match = text.match(fetchRegEx);

    if (match) {
      // Call the RetrieveURLs function
      let urlContent = await this.ReplaceUrl(text);
      let prompt = `Here is the content of the URL you requested : ${urlContent}. Feel free to ::fetch any URL which sounds like it might help fill in details.\n`
      return prompt
    }

    // Regular expression to check for ::fetch followed by a URL
    const searchRegEx = /::search\s*`(.+?)`/i;
    match = text.match(searchRegEx);
    if (match) {
      // Get the URL which is the string following "::fetch "
      const query = match[1].trim();
      // Call the CallSearx function
      let results = await this.CallSearx(query);
      let prompt = `Here are the results of the search for "${query}" you requested.\n<LINKED>${results}</LINKED>. Feel free to ::fetch any URL which sounds like it might help fill in details.\n`
      return prompt
    }
    return ""
  }

  async  CallSearx(query:string):Promise<string> {
    let queryRequest:QueryRequest = {
      query:query
    }
    try{
      let response:UrlResponse =  await lastValueFrom(
        this.http.post<UrlResponse>(
          `${environment.companionUrl}/async/search?cache=${Math.floor(Math.random() * 10000000)}`,
          queryRequest,
          {
            responseType: 'json',
          }
        )
      );
      // @ts-ignore
      return response.content;
    } catch (error) {
      console.error(error);
      let rs = new UrlResponse();
      rs.content = "An error occurred while fetching url.";
      rs.returnCode = 500;
      return "";
    }
  }

  async  fetchUrl(text:string):Promise<UrlResponse> {
    let urlRequest:UrlRequest = {
      url:text
    }
    try{
      let response:UrlResponse =  await lastValueFrom(
        this.http.post<UrlResponse>(
          `${environment.companionUrl}/async/fetch?cache=${Math.floor(Math.random() * 10000000)}`,
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

  async ReplaceUrl(source:string):Promise<string> {
    const urlRegEx = /((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/(\w#!:.?\+=&%@!\-\/\]])])?)/i;
    let match = source.match(urlRegEx);
    console.log(source)
    if (match) {
      // Get the URL which is the string following "::fetch "
      const url = match[1].trim().replace(/['"`´]/g, "");
      console.log(url)
      let body = await this.fetchUrl(url);
      let content = this.TruncateToTokens(body.content, MAX_TOKENS)
      let result = ` ( url:"${url}",  ReturnCode:${body.returnCode} )<LINKED>${content}</LINKED>`;
      source = source.replace(url, result);
    }
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
    this.username = this.localStorage.getItem("username") ?? "not set";
    return this.username;
  }

  SetUsername(username:string): void {
    this.username = username;
    this.localStorage.setItem('username', username);
  }

  ClearUsername(): void {
    this.username = "";
    this.localStorage.removeItem('username');
  }
}

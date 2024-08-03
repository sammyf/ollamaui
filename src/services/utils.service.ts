import { Injectable } from '@angular/core';
import hljs from "highlight.js";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() {
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

import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HideUrlSourcePipe} from "../../pipes/hide-url-source.pipe";
import {Messages} from "../../models/ollama.models";
import {ChatBoxComponent} from "../chat-box/chat_box.component";
import {MemoryService} from "../../services/memory.service";
import {Router} from "@angular/router";
import {CookieStorageService} from "../../services/cookie-storage.service";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
  selector: 'full_chat',
  templateUrl: './full_chat.component.html',
  styleUrls: ['./full_chat.component.css'],
  imports: [
    ChatBoxComponent,
    NgIf,
    HideUrlSourcePipe,
  ],
  standalone: true,
})
export class fullChatComponent implements OnInit {
  chat_memory: Array<Messages> = [];
  csrfToken: string|null = "";
  constructor(private  memoryService: MemoryService, private localStorage: LocalStorageService,) {
    this.csrfToken = localStorage.getItem("csrfToken");
    console.log(this.csrfToken);
  }
  async ngOnInit() {
    if( this.csrfToken !== null ) {
      this.chat_memory = await this.memoryService.ReadChatLog(this.csrfToken);
    } else {
      let msg:Messages = {
        index: 0,
        role: 'user',
        content: 'Not Logged In',
        persona: 'Not Logged In',
      }
      this.chat_memory = [msg]
    }
  }
}

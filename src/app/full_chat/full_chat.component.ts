import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HideUrlSourcePipe} from "../../pipes/hide-url-source.pipe";
import {Messages} from "../../models/ollama.models";
import {ChatBoxComponent} from "../chat-box/chat_box.component";
import {MemoryService} from "../../services/memory.service";

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
  constructor(private  memoryService: MemoryService) {

  }
  async ngOnInit() {
    this.chat_memory = await this.memoryService.ReadChatLog();
  }
}

import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {MemoryDetailRequest, Messages} from '../../models/ollama.models';
import {CommonModule, NgIf} from '@angular/common';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HideUrlSourcePipe} from "../../pipes/hide-url-source.pipe";
import {MemoryService} from "../../services/memory.service";

@Component({
    selector: 'chat_box',
    templateUrl: './chat_box.component.html',
    styleUrls: ['./chat_box.component.css'],
    imports: [
        NgIf,
        HideUrlSourcePipe,
    ],
    standalone: true,
})
export class ChatBoxComponent implements OnInit {
  @Input() content: string="";
  @Input() role: string="";
  @Input() persona: string="";
  @Input() isMemory: boolean=false;
  @Input() firstId: number=-1;
  @Input() lastId: number=-1;
  @Input() csrfToken: string|null = null;
  showMemory: boolean = false;
  chatMemory: Array<Messages> = []

  constructor(private memoryService: MemoryService) {
  }

  async ngOnInit() {
    if(this.csrfToken !== null) {
      this.chatMemory = await this.memoryService.GetMemoryDetails(this.csrfToken, this.firstId, this.lastId);
    }
  }
  async onClick() {
    this.showMemory = !this.showMemory;
  }
}

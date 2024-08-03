import { Component, Input } from '@angular/core';
import { Messages } from '../models/ollama.models';
import {CommonModule, NgIf} from '@angular/common';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'chat_box',
  templateUrl: './chat_box.component.html',
  styleUrls: ['./chat_box.component.css'],
  imports: [
    NgIf,
  ],
  standalone: true,
})
export class ChatBoxComponent {
  @Input() content!: string;
  @Input() role!: string;
  @Input() persona!: string;
}

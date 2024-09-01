import {Component, Input} from '@angular/core';
import {ChatBoxComponent} from "../chat-box/chat_box.component";
import {NgIf} from "@angular/common";
import {Messages} from "../../models/ollama.models";

@Component({
  selector: 'app-memory-details',
  standalone: true,
  imports: [
    ChatBoxComponent,
    NgIf
  ],
  templateUrl: './memory-details.component.html',
  styleUrl: './memory-details.component.css'
})
export class MemoryDetailsComponent {
  @Input() chat_history: Array<Messages> = [];
}

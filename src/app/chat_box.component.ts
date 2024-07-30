import { Component, Input } from '@angular/core';
import { Messages } from '../models/ollama.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chat_box',
  templateUrl: './chat_box.component.html',
  styleUrls: ['./chat_box.component.css'],
  imports: [],
  standalone: true,
})
export class ChatBoxComponent {
  @Input() content!: string;
  @Input() role!: string;
  @Input() persona!: string;
}

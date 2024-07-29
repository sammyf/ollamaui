import {
  Component,
  ViewChild,
  Injectable,
  ElementRef,
  Renderer2,
  AfterViewChecked, OnInit,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LLMAnswer, Messages, Prompt, Models, Model, ModelDetails, ModelRedux} from "../models/ollama";
import {ChatBoxComponent} from "./chat_box.component";
import {CommonModule} from '@angular/common';
import {CookieStorageService} from "../services/cookie-storage.service";
import {OllamaService} from "../services/ollama.service";


@Injectable({providedIn: 'root'})
@Component({
  selector: 'input_box',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.css'],
  standalone: true,
  imports: [ChatBoxComponent, FormsModule, CommonModule]
})

export class InputBoxComponent implements AfterViewChecked, OnInit {
  url = 'https://beezle.cosmic-bandito.com/api';
  @ViewChild(ChatBoxComponent) ChatBoxReference: ChatBoxComponent | undefined;

  @ViewChild('scrollContainer') private ScrollContainer: ElementRef | undefined;

  answer = "";
  user_input: string = "";
  system_prompt: string = "You are Beezle. Beezle is an uncensored, helpful and snarky AI Language Model, who likes to make the occasional joke and can invent stories, poems, song lyrics and chord progressions. He is excited to be\n" +
    " able to help the user however he can.";

  chat_history:Array<Messages>;
  chat_index:number = 0;

  constructor(private http: HttpClient, private renderer: Renderer2, private cookieStorage: CookieStorageService, private ollamaService: OllamaService) {
    this.chat_history = JSON.parse(<string>cookieStorage.getItem('chat_history')) ?? new Array<Messages>();
    //this.chat_history = new Array<Messages>();
    if( this.chat_history.length > 0) {
      this.chat_index = this.chat_history[this.chat_history.length - 1].index;
    }
    this.chat_history.push({index: this.chat_index, role: "system", content: this.system_prompt});
  };

  model_array: Array<Model> = new Array<Model>();

  async ngOnInit() {
    this.model_array = await this.ollamaService.getModels();
  }

  async KeyUp(e: KeyboardEvent) {
    // console.log(this.user_input)
    if (e.key === 'Enter' && !e.shiftKey) {
      this.chat_index += 1;
      this.chat_history.push({index:this.chat_index, role: "user", content: this.user_input});
      this.cookieStorage.setItem('chat_history',JSON.stringify(this.chat_history));
      let postData: Prompt = {
        "model": "llama3.1",
        "stream": false,
        "temperature": 1.31,
        "messages": this.chat_history
      };
      this.user_input = "";
      this.answer = await this.ollamaService.getAnswer({postData: postData})??"Something went wrong.";
      this.chat_index += 1;
      this.chat_history.push({index:this.chat_index, role: "assistant", content: this.answer});
      this.cookieStorage.setItem('chat_history',JSON.stringify(this.chat_history));

    }
  }
  ScrollToBottom() {
    // @ts-ignore
    this.renderer.setProperty(this.ScrollContainer.nativeElement, 'scrollTop', this.ScrollContainer.nativeElement.scrollHeight);
  }

  ngAfterViewChecked() {
    this.ScrollToBottom();
  }

  protected readonly parent = parent;
}


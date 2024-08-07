import {
  Component,
  ViewChild,
  Injectable,
  ElementRef,
  Renderer2,
  AfterViewChecked, OnInit, Input, Output, ChangeDetectorRef,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LLMAnswer, Messages, Prompt, Models, Model, ModelDetails, ModelRedux, Persona} from "../models/ollama.models";
import {ChatBoxComponent} from "./chat_box.component";
import {CommonModule} from '@angular/common';
import {LocalStorageService} from "../services/local-storage.service";
import {OllamaService} from "../services/ollama.service";
import {PersonasService} from "../services/personas.service";
import {CookieStorageService} from "../services/cookie-storage.service";
import {UtilsService} from "../services/utils.service";
import {UsernamePopupComponent} from "./username-popup/username-popup.component";
import {TtsService} from "../services/tts.service";
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {runPostSignalSetFn} from "@angular/core/primitives/signals";
import {Event} from "@angular/router";
import { environment } from '../environments/environment';
// Highlighter
import hljs from 'highlight.js';

/* TODO :
  * permanent memory
  * call to the TTS server
  * call to the internet/searx Engine
  * tests
 */

@Injectable({providedIn: 'root'})
@Component({
  selector: 'input_box',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.css'],
  standalone: true,
  imports: [ChatBoxComponent, FormsModule, CommonModule, UsernamePopupComponent],
})

export class InputBoxComponent implements AfterViewChecked, OnInit {

  url = `${environment.serverUrl}/api`;
  @ViewChild(ChatBoxComponent) ChatBoxReference: ChatBoxComponent | undefined;
  @ViewChild('scrollContainer') private ScrollContainer: ElementRef | undefined;
  @ViewChild('TTSPlayer') audioPlayer: ElementRef | undefined;

  // @ts-ignore
  safeUrl: SafeResourceUrl;
  // @ts-ignore
  safeHtml: SafeHtml;
  personas: Array<Persona> = new Array<Persona>();
  currentPersona: Persona| undefined = new class implements Persona {
    context: string = "";
    name: string = "";
    role: string= "";
    speaker: string = "";
  };

  username:string = "";
  showUsernamePopup = false;
  previousUsername:string = "";

  ttsClip: string = "";

  DefaultContext :string = "";
  DefaultPersona :string = "Beezle"
  DefaultModel: string = "gemma2:2b";

  selectedModel:string = this.DefaultModel;
  previousModel:string = this.selectedModel;

  selectedPersona:string = this.DefaultModel;
  spinnerState:boolean = true;

  previousSelectedPersona:string = "";
  answer = "";
  user_input: string = "";
  system_prompt: string = this.DefaultContext;

  chat_history:Array<Messages>;
  chat_index:number = 0;

  constructor(private http: HttpClient,
              private renderer: Renderer2,
              private localStorage: LocalStorageService,
              private formsModule: FormsModule,
              private ollamaService: OllamaService,
              private personasService: PersonasService,
              private cookieService: CookieStorageService,
              private utilService: UtilsService,
              private ttsService: TtsService,
              private sanitizer: DomSanitizer,
              private cdRef: ChangeDetectorRef
  ) {
    this.chat_history = JSON.parse(<string>localStorage.getItem('chat_history')) ?? new Array<Messages>();
    this.personas = personasService.getAllPersonas().sort((a:Persona, b:Persona) => {
      let al= a.name.toLowerCase();
      let bl = b.name.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return 0;
    });
    if( this.chat_history.length > 0) {
      this.chat_index = this.chat_history[this.chat_history.length - 1].index;
    }
    this.chat_history.push({index: this.chat_index, role: "system", content: this.system_prompt, persona:"user"});
  };

  model_array: Array<Model> = new Array<Model>();

  private showSpinner(onoff:boolean) {
    this.spinnerState = onoff;
  }

  async ngOnInit() {
    this.showSpinner(true);
    let currentModel = await this.ollamaService.GetCurrentModel();
    if(currentModel === "None") {
      if ((this.localStorage.getItem("currentModel") !== undefined) && (this.localStorage.getItem("currentModel") !== "")) {
        this.selectedModel = this.localStorage.getItem("currentModel") ?? "";
      } else {
        this.selectedModel = this.DefaultModel;
      }
    }  else {
      this.selectedModel = currentModel;
    }
    this.previousModel = this.selectedModel;

    if(this.localStorage.getItem("currentPersona") !== undefined) {
      this.selectedPersona = this.localStorage.getItem("currentPersona") ?? "";
    } else {
      this.selectedPersona = this.DefaultPersona;
    }
    this.model_array = await this.ollamaService.getModels();
    // @ts-ignore
    this.model_array = [...this.model_array].sort((a, b) => {
      let al= a.name.toLowerCase();
      let bl = b.name.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return 0;
    });
    this.showSpinner(false);


    // @ts-ignore
    this.audioPlayer.nativeElement.volume = parseFloat(this.localStorage.getItem("volume"));
  }

  async KeyUp(e: KeyboardEvent) {
    // console.log(this.user_input)
    if (e.key === 'Enter' && !e.shiftKey) {
      this.showSpinner(true);
      this.username = this.utilService.GetUsername();
      if(this.previousSelectedPersona === "" || this.previousSelectedPersona === undefined) {
        this.previousSelectedPersona = this.selectedPersona;
        this.SetPersona("");
      } else if(this.selectedPersona !== this.previousSelectedPersona){
        this.SetPersona(`** BEEP ** Personality switch happening! ${this.previousSelectedPersona} disappears in a digital puff of magical bytes. YOU are ${this.selectedPersona}, and at your place used to be ${this.previousSelectedPersona}. I, on the other hand, am ${this.username}!  *** BEEP *** `);
        this.previousSelectedPersona = this.selectedPersona;
        //this.chat_history = new Array<Messages>();
      } else if( this.username !== undefined && this.username !== "" && this.username !== this.previousUsername) {
        this.SetContext("")
      }
      this.previousUsername = this.username;
      this.chat_index += 1;
      console.log("this user input:"+this.user_input);
      let expandedUserInput = await this.utilService.ReplaceUrls(this.user_input)
      console.log("expanded : "+expandedUserInput);
      this.chat_history.push({index:this.chat_index, role: "user", content: this.utilService.GetTimeDate()+expandedUserInput, persona:"user"});
      this.localStorage.setItem('chat_history',JSON.stringify(this.chat_history));

      if((this.selectedModel === undefined) || (this.selectedModel === "")) {
        this.selectedModel = this.DefaultModel;
      }
      if(this.previousModel !== this.previousModel){
        this.ollamaService.UnloadModel(this.previousModel);
        this.previousModel = this.selectedModel;
      }
      this.localStorage.setItem("currentModel",this.selectedModel);
      let postData: Prompt = {
        "model": this.selectedModel,
        "stream": false,
        "temperature": 1.31,
        "messages": this.chat_history,
        "keep_alive": -1
      };
      this.user_input = "";
      this.answer = await this.ollamaService.sendRequest({postData: postData})??"Something went wrong.";
      this.ttsClip = await this.ttsService.getTTS(this.answer, this.currentPersona?.speaker??"p243");
      this.updateAudioSource();
      this.chat_index += 1;
      // const highlightedCode = hljs.highlightAuto(
      //   this.answer,
      // ).value
      let highlightedCode = this.utilService.DoHighlight(this.answer);

      this.chat_history.push({index:this.chat_index, role: "assistant", content:  highlightedCode, persona: this.selectedPersona});
      let rs = JSON.stringify(this.reverseTruncateHistory(4000))
      this.localStorage.setItem('chat_history', rs);
      this.showSpinner(false);
    }
  }

  SetPersona(contextAdd:string ) {
    this.previousSelectedPersona = this.selectedPersona;
    this.currentPersona = this.personas.find(persona => persona.name === this.selectedPersona);
    this.localStorage.setItem("currentPersona", this.selectedPersona);
    this.SetContext(contextAdd);
  }

  SetContext(contextAdd:string){
    this.system_prompt = this.currentPersona?.context??this.DefaultContext;
    this.chat_history.push({index:this.chat_index, role: "system", content: this.system_prompt, persona: "user"});
  }

  reverseTruncateHistory(size:number):Array<Messages> {
    let rs: Array<Messages> = [];
    let cnt : number = 0;
    const buffer = 10;
    let revHist = [...this.chat_history].reverse();

    // Using a 'for' loop
    for(let i = 0; i < revHist.length; i++) {
      rs.push(revHist[i]);
      cnt += revHist[i].content.length + revHist[i].role.length + buffer;
      if (cnt >= size) {
        break; // Early termination of the loop
      }
    }

    return rs.reverse();
  }

  ScrollToBottom() {
    // @ts-ignore
    this.renderer.setProperty(this.ScrollContainer.nativeElement, 'scrollTop', this.ScrollContainer.nativeElement.scrollHeight);
  }

  ngAfterViewChecked() {
    this.ScrollToBottom();
  }

  updateAudioSource(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.ttsClip);
    // Manually trigger change detection to ensure the template updates immediately
    this.cdRef.detectChanges();
    this.audioPlayer ? this.audioPlayer.nativeElement.load : undefined;
  }

  SetTTSVolume() {
    //@ts-ignore
    this.localStorage.setItem("volume", this.audioPlayer.nativeElement.volume.toString())
  }

  ClearUsername() {
    this.showUsernamePopup = true;
  }

  protected readonly parent = parent;
  protected readonly Event = Event;
}


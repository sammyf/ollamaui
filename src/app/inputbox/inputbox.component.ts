// TODO:
//     * Create a chat_history_buffer and a button to display the whole conversation as a single page
//     * Add a button to clear the chat_history
//     * Searx Engine Support
//     * Talk to remote LLM
//     * image and file upload
//     * Autonomous Personal change
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
import {LLMAnswer, Messages, Prompt, Models, Model, ModelDetails, ModelRedux, Persona} from "../../models/ollama.models";
import {ChatBoxComponent} from "../chat-box/chat_box.component";
import {CommonModule} from '@angular/common';
import {LocalStorageService} from "../../services/local-storage.service";
import {OllamaService} from "../../services/ollama.service";
import {PersonasService} from "../../services/personas.service";
import {CookieStorageService} from "../../services/cookie-storage.service";
import {UtilsService} from "../../services/utils.service";
import {UsernamePopupComponent} from "../username-popup/username-popup.component";
import {TtsService} from "../../services/tts.service";
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {runPostSignalSetFn} from "@angular/core/primitives/signals";
import {Event, Router, Routes} from "@angular/router";
import { environment } from '../../environments/environment';
// Highlighter
import hljs from 'highlight.js';
import {Message} from "nx/src/daemon/client/daemon-socket-messenger";
import {fullChatComponent} from "../full_chat/full_chat.component";
import {MemoryService} from "../../services/memory.service";

/* TODO :
  * tests
 */
const routes: Routes = [
  {
    path: '/showFullChat',
    component: fullChatComponent
  }
  ];

@Injectable({providedIn: 'root'})
@Component({
  selector: 'input_box',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.css'],
  standalone: true,
  imports: [ChatBoxComponent, FormsModule, CommonModule, UsernamePopupComponent, fullChatComponent],
})

export class InputBoxComponent implements AfterViewChecked, OnInit {
  newWindow: Window | null;
  url = `${environment.companionUrl}/api`;
  @ViewChild(ChatBoxComponent) ChatBoxReference: ChatBoxComponent | undefined;
  @ViewChild('scrollContainer') private ScrollContainer: ElementRef | undefined;
  @ViewChild('textInput') private textInputElement: ElementRef | undefined;

  @ViewChild('TTSPlayer') audioPlayer: ElementRef | undefined;

  // @ts-ignore
  safeUrl: SafeResourceUrl;
  // @ts-ignore
  safeHtml: SafeHtml;
  personas: Array<Persona> = new Array<Persona>();
  currentPersona: Persona | undefined = new class implements Persona {
    context: string = "";
    name: string = "";
    role: string = "";
    speaker: string = "";
  };

  username: string | null = "";
  showUsernamePopup = false;
  previousUsername: string = "";

  ttsClip: string = "";

  chatLinesUntilNextContext: number = -1;
  renewContextAfter: number = 15;

  DefaultContext: string = "";
  DefaultPersona: string = "Beezle"
  DefaultModel: string = "gemma2:2b";

  selectedModel: string = "None";
  previousModel: string = this.selectedModel;
  model: Model | undefined = undefined;
  selectedPersona: string = this.DefaultModel;
  spinnerState: boolean = true;

  previousSelectedPersona: string = "";
  answer = "";
  user_input: string = "";
  system_prompt: string = this.DefaultContext;
  system_tools: string = ""
  csrfToken: string | null;
  chat_history: Array<Messages> = [];
  chat_memory: Array<Messages> = [];

  chat_index: number = 0;
  showFullChatToggle: boolean = false;

  constructor(private http: HttpClient,
              private renderer: Renderer2,
              private localStorage: LocalStorageService,
              private formsModule: FormsModule,
              private ollamaService: OllamaService,
              private memoryService: MemoryService,
              private personasService: PersonasService,
              private cookieService: CookieStorageService,
              private utilService: UtilsService,
              private ttsService: TtsService,
              private sanitizer: DomSanitizer,
              private cdRef: ChangeDetectorRef,
              private router: Router
  ) {
    this.newWindow = null;
    this.csrfToken =localStorage.getItem("csrfToken");
    this.username = localStorage.getItem("username");
    this.system_tools = utilService.GetCommandPrompt();

    if ((this.csrfToken === "") || (this.csrfToken === undefined) ||
      (this.username === "") || (this.username === undefined)) {
      this.router.navigate(["/login"], {skipLocationChange: true});
    }


    this.personas = personasService.getAllPersonas().sort((a: Persona, b: Persona) => {
      let al = a.name.toLowerCase();
      let bl = b.name.toLowerCase();
      if (al < bl) return -1;
      if (al > bl) return 1;
      return 0;
    });

  };

  model_array: Array<Model> = new Array<Model>();

  private showSpinner(onoff: boolean) {
    this.spinnerState = onoff;
    if (!onoff) {
      // @ts-ignore
      setTimeout(() => this.textInputElement.nativeElement.focus(), 0);
    }
  }

  async ngOnInit() {
    this.showSpinner(true);
    await this.memoryService.GenerateMemories(this.csrfToken ?? "")


    let currentModel = await this.ollamaService.GetCurrentModel();
    if( currentModel !== "None" ) {
      this.selectedModel = currentModel
    }
    console.log("Current Model : "+currentModel);

    if ((this.localStorage.getItem("currentModel") !== undefined) &&
      (this.localStorage.getItem("currentModel") !== "") &&
      (this.CheckModelName(this.localStorage.getItem("currentModel") ?? "None"))) {
      console.log("+++++++++++++++++++++  A");
      this.selectedModel = this.localStorage.getItem("currentModel") ?? "";
    }
    if( this.selectedModel === "None" ) {
      console.log("+++++++++++++++++++++  B");
      this.model_array = await this.ollamaService.getModels();
      let r: number = Math.floor(Math.random() * this.model_array.length);
      this.selectedModel = this.model_array[r].name;
    }
    this.previousModel = this.selectedModel;
    this.model_array = await this.ollamaService.getModels();

    this.previousSelectedPersona = "a personality-less entity";
    this.model = this.GetModel();
    if ((this.localStorage.getItem("currentPersona") !== undefined) &&
      (this.localStorage.getItem("currentPersona") !== "") &&
      (this.CheckPersonaName(this.localStorage.getItem("currentPersona") ?? "None"))) {
      console.log("stored persona" + this.localStorage.getItem("currentPersona"));
      this.selectedPersona = this.localStorage.getItem("currentPersona") ?? "";
    } else {
      let r: number = Math.floor(Math.random() * this.personas.length);
      this.selectedPersona = this.personas[r].name;
    }

    // this.chat_history = JSON.parse(<string>localStorage.getItem('chat_history')) ?? new Array<Messages>();
    this.chat_history = await this.memoryService.RetrieveDiscussions(this.csrfToken ?? "")
    if (this.chat_memory.length === 0) {
      this.chat_memory = this.chat_history
    }
    if (this.chat_history.length > 0) {
      this.chat_index = this.chat_history[this.chat_history.length - 1].index;
    }
    this.AddToChat({index: this.chat_index, role: "system", content: this.system_prompt+this.system_tools, persona: "user"});
    this.chat_memory = this.chat_history
    // @ts-ignore
    this.model_array.sort((a, b) => {
      if (a.details.parameter_size === b.details.parameter_size) {
        // If parameter_size are equal then sort by name
        // localeCompare is String method that returns a number indicating whether a reference string comes before,
        // or after or is the same as the given string in sort order.
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      } else {
        let aSize = parseFloat(a.details.parameter_size.replace('B',''));
        let bSize = parseFloat(b.details.parameter_size.replace('B',''));
        // If parameter_size are not equal then sort by parameter_size
        return aSize - bSize;
      }
    });

    this.username = this.localStorage.getItem("username") ?? "not set";
    let volume: number = 0.5;
    try {
      volume = parseFloat(this.localStorage.getItem("volume") ?? "0.5");
    } catch (error) {
      volume = 0.5
    }

    console.log("Volume is: ", volume);
    // @ts-ignore
    this.audioPlayer.nativeElement.volume = volume;
    this.SetPersona("", true);

    this.showSpinner(false);
  }

  async KeyUp(e: KeyboardEvent) {
    // console.log(this.user_input)
    if (e.key === 'Enter' && !e.shiftKey) {
      await this.GetLLMAnswer(this.user_input);
    }
  }

  async GetLLMAnswer(input: string) {
    this.showSpinner(true);
    this.username = this.utilService.GetUsername();
    if (this.previousSelectedPersona === "" || this.previousSelectedPersona === undefined) {
      this.previousSelectedPersona = this.selectedPersona;
      this.SetPersona(`You are ${this.selectedPersona}`, false);
    } else if (this.selectedPersona !== this.previousSelectedPersona) {
      this.SetPersona('', true);
      this.previousSelectedPersona = this.selectedPersona;
      //this.chat_history = new Array<Messages>();
    }
    this.username = this.utilService.GetUsername();
    if (this.username !== undefined && this.username !== "" && this.username !== this.previousUsername) {
      this.SetContext("");
    }
    this.previousUsername = this.username;
    if (this.chatLinesUntilNextContext < 0) {
      this.SetContext("THIS IS A REMINDER!")
    }
    let expandedUserInput = await this.utilService.ReplaceUrl(input)
    this.AddToChat({
      index: this.chat_index,
      role: "user",
      content: this.utilService.GetTimeDate() + expandedUserInput,
      persona: "user"
    });
    this.chatLinesUntilNextContext -= 1;
    this.localStorage.setItem('chat_history', JSON.stringify(this.chat_history));

    if ((this.selectedModel === undefined) || (this.selectedModel === "")) {
      let r: number = Math.floor(Math.random() * this.model_array.length);
      this.selectedModel = this.model_array[r].name;
    }
    if (this.selectedModel !== this.previousModel) {
      if (this.previousModel != "") {
        this.ollamaService.UnloadModel(this.previousModel);
      }
      this.previousModel = this.selectedModel;
    }
    this.localStorage.setItem("currentModel", this.selectedModel);
    this.model = this.GetModel();
    let postData: Prompt = {
      "model": this.selectedModel,
      "stream": false,
      "temperature": 1.31,
      "messages": this.chat_history,
      "keep_alive": -1,
      "num_ctx": 64000
    };
    this.user_input = "";
    this.answer = await this.ollamaService.sendRequest({postData: postData}) ?? "Something went wrong.";
    console.log("Answer received!")
    let cmd = await this.utilService.LookForCommands(this.answer)
    console.log("Command found : ",cmd)
    if (cmd !== "") {
      await this.DisplayLLMAnswer()
      await this.GetLLMAnswer(cmd)
      return
    }

    await this.DisplayLLMAnswer()
    let rs = JSON.stringify(this.reverseTruncateHistory(5000))
    this.localStorage.setItem('chat_history', rs);
    this.showSpinner(false);
  }

  async DisplayLLMAnswer() {
    this.ttsClip = await this.ttsService.getTTS(this.answer, this.currentPersona?.speaker ?? "p243");
    this.updateAudioSource();
    let highlightedCode = this.answer;
    try {
        highlightedCode = this.utilService.DoHighlight(this.answer);
    } catch (e) {
        // pass
    }

    this.AddToChat({
      index: this.chat_index,
      role: "assistant",
      content: highlightedCode,
      persona: this.selectedPersona
    });
    this.chatLinesUntilNextContext -= 1;
  }

  GetModel(): Model | undefined {
    return this.model_array.find(model => model.name === this.selectedModel);
  }

  AddToChat(entry: Messages): void {
    console.log("csrfToken : '", this.csrfToken, "'");
    if (this.csrfToken && this.csrfToken !== "") {
      this.memoryService.StoreChatLog(this.csrfToken, entry);
      this.chat_history.push(entry);
      this.chat_memory.push(entry);
      this.chat_index += 1;
      this.chat_history = this.reverseTruncateHistory(64000);
    } else {
      this.router.navigate(["/login"], {skipLocationChange: true});
    }
  }

  ShowFullChat() {
    this.newWindow = window.open('/chatlog', '_blank');
  }

  CheckModelName(model: string): boolean {
    if (model) {
      let exists = this.model_array.some(item => item.name === model);
      if (exists) {
        return true
      }
    }
    return false;
  }

  CheckPersonaName(name: string): boolean {
    if (name) {
      let exists = this.personas.some(item => item.name === name);
      if (exists) {
        return true
      }
    }
    return false;
  }


  async SwitchPersonality() {
    this.SetPersona("", true)
    await this.GetLLMAnswer(`[[The user summoned ${this.selectedPersona}!]]`)
  }

  SetPersona(contextAdd:string, personaSwitch:boolean) {
    if(personaSwitch) {
      contextAdd = `${this.previousSelectedPersona} disappears in a digital puff of magical bytes and is now absent from and unaware of this chat. ${contextAdd}`
    }
    this.previousSelectedPersona = this.selectedPersona;

    this.currentPersona = this.personas.find(persona => persona.name === this.selectedPersona);
    this.localStorage.setItem("currentPersona", this.selectedPersona);
    this.SetContext(contextAdd);
  }

  SetContext(contextAdd:string){
    this.chatLinesUntilNextContext = this.renewContextAfter
    this.system_prompt = `${contextAdd}. My, the user, name is ${this.username}. ${this.currentPersona?.context??this.DefaultContext}.You, the AI, are ${this.selectedPersona}.`;
    this.AddToChat({index:this.chat_index, role: "system", content: this.system_prompt, persona: "user"});
  }

  reverseTruncateHistory(size:number):Array<Messages> {
    let rs: Array<Messages> = [];
    let cnt : number = 0;
    const buffer = 10;
    let revHist = [...this.chat_history].reverse();
    for(let i = 0; i < revHist.length; i++) {
      rs.push(revHist[i]);
      cnt += revHist[i].content.length + revHist[i].role.length + buffer;
      if (cnt >= size) {
        break;
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


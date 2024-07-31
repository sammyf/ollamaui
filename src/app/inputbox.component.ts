import {
  Component,
  ViewChild,
  Injectable,
  ElementRef,
  Renderer2,
  AfterViewChecked, OnInit, Input, Output,
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

/* TODO :
  * add a text box for the user to enter their name and gender.
  * permanent memory
  * shared memory across personaties
  * call to the TTS server
  * call to the internet/searx Engine
 */


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

  personas: Array<Persona> = new Array<Persona>();
  currentPersona: Persona| undefined = new class implements Persona {
    context: string = "";
    name: string = "";
    role: string= "";
    speaker: string = "";
  };

  username:string = "";
  previousUsername:string = "";

  DefaultContext :string = "";
  DefaultPersona :string = ""
  DefaultModel: string = "";

  selectedModel:string = this.DefaultModel;
  selectedPersona:string = this.DefaultModel;
  spinnerState:string = "block"

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
              private cookieService: CookieStorageService) {
    this.chat_history = JSON.parse(<string>localStorage.getItem('chat_history')) ?? new Array<Messages>();
    this.personas = personasService.getAllPersonas();
    if( this.chat_history.length > 0) {
      this.chat_index = this.chat_history[this.chat_history.length - 1].index;
    }
    this.chat_history.push({index: this.chat_index, role: "system", content: this.system_prompt, persona:"user"});
  };

  model_array: Array<Model> = new Array<Model>();

  private showSpinner(onoff:boolean) {
    this.spinnerState = onoff ? "block" : "none";
  }

  async ngOnInit() {
    this.showSpinner(true);
    if(this.localStorage.getItem("currentModel") != undefined){
      this.selectedModel = this.localStorage.getItem("currentModel") ?? "";
    } else {
      this.selectedModel = this.DefaultModel;
    }

    if(this.localStorage.getItem("currentPersona") != undefined) {
      this.selectedPersona = this.localStorage.getItem("currentPersona") ?? "";
    } else {
      this.selectedPersona = this.DefaultPersona;
    }


    this.model_array = await this.ollamaService.getModels();
    this.showSpinner(false);
  }

  async KeyUp(e: KeyboardEvent) {
    // console.log(this.user_input)
    if (e.key === 'Enter' && !e.shiftKey) {
      this.showSpinner(true);
      if(this.previousSelectedPersona === "" || this.previousSelectedPersona === undefined) {
        this.previousSelectedPersona = this.selectedPersona;
        this.SetPersona("");
      } else if(this.selectedPersona !== this.previousSelectedPersona){
        this.SetPersona(this.previousSelectedPersona+" left the room. "+this.selectedPersona+" enters.");
        this.previousSelectedPersona = this.selectedPersona;
        //this.chat_history = new Array<Messages>();
      } else if( this.username !== undefined && this.username !== undefined && this.username !== this.previousUsername) {
        this.previousUsername = this.username;
        this.SetContext("")
      }
      this.chat_index += 1;
      this.chat_history.push({index:this.chat_index, role: "user", content: this.GetTimeDate()+this.user_input, persona:"user"});
      this.localStorage.setItem('chat_history',JSON.stringify(this.chat_history));
      if((this.selectedModel === undefined) || (this.selectedModel === "")) {
        this.selectedModel = this.model_array[0].name;
      }
      this.localStorage.setItem("previous_model",this.selectedModel);
      let postData: Prompt = {
        "model": this.selectedModel,
        "stream": false,
        "temperature": 1.31,
        "messages": this.chat_history
      };
      this.user_input = "";
      this.answer = await this.ollamaService.getAnswer({postData: postData})??"Something went wrong.";
      this.chat_index += 1;
      this.chat_history.push({index:this.chat_index, role: "assistant", content: this.answer, persona: this.selectedPersona});
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
    this.chat_history.push({index:this.chat_index, role: "system", content: this.system_prompt, persona: "system"});
  }

  GetTimeDate(){
    let dateOb = new Date();

    let date = ("0" + dateOb.getDate()).slice(-2);
    let month = ("0" + (dateOb.getMonth() + 1)).slice(-2);
    let year = dateOb.getFullYear();
    let hours = ("0" + dateOb.getHours()).slice(-2);
    let minutes = ("0" + dateOb.getMinutes()).slice(-2);
    let seconds = ("0" + dateOb.getSeconds()).slice(-2);

    return "["+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"] ";
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

  protected readonly parent = parent;
}


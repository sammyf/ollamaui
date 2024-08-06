import {SafeHtml} from "@angular/platform-browser";
import {sanitizeIdentifier} from "@angular/compiler";

export interface LLMAnswer {
  model: string;
  created_at: string;
  message: Messages;
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

// export interface Messages {
//   index: number;
//   role: string;
//   content: string;
//   persona: string | 'Diem';
// }

// export interface Prompt {
//   model: string;
//   stream: boolean;
//   temperature: number;
//   messages: Array<Messages>;
// }

export interface ModelDetails {
  format: string;
  family: string;
  families: Array<string>;
  parameter_size: string;
  quantization_level: string;
}

export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export interface Models {
  models: Array<Model>;
}

export interface ModelRedux {
  index: number;
  name: string;
  parameter_size: string;
  quantization_level: string;
}

export interface Answer {
  postData: Prompt;
}

// export interface Persona {
//   name: string;
//   context: string;
//   speaker: string;
//   role: string;
// }

export class Messages {
  constructor(
    public index: number,
    public role: string,
    public content: string,
    public persona: string = 'Diem'
  ) {
    this.index = index;
    this.role = role;
    this.content = content;
    this.persona = persona;
  }
}

export class Persona {
  constructor(
    public name: string = '',
    public context: string = '',
    public speaker: string = '',
    public role: string = ''
  ) {
    this.name = name;
    this.context = context;
    this.speaker = speaker;
    this.role = role;
  }
}

export class Prompt {
  constructor(
    public model: string = 'llama3.1',
    public stream: boolean = false,
    public temperature: number = 1.31,
    public messages: Array<Messages> = new Array<Messages>(),
    public keep_alive: number = 0
  ) {
    this.model = model;
    this.stream = stream;
    this.temperature = temperature;
    this.messages = messages;
  }
}

export class PsModelDetail {
  parent_model: string = "None";
  format: string = "None";
  family: string = "None";
  families: string[] = [];
  parameter_size: string = "None";
  quantization_level: string = "None";
}

export class PsModel {
  name: string = "None";
  model: string = "None";
  size: number = 0;
  digest: string = "None";
  details: PsModelDetail | undefined = undefined;
  expires_at: string  = "None";
  size_vram: number = 0;
}

export class PsModelsData {
  models: PsModel[] = [];
}

export interface LLMAnswer {
  model:string;
  created_at:string;
  message: Messages;
  done:boolean;
  total_duration:number;
  load_duration:number;
  prompt_eval_count: number;
  prompt_eval_duration:number;
  eval_count:number;
  eval_duration:number;
}
export interface Messages {
  index: number
  role: string;
  content: string;
}

export interface Prompt {
  model:string;
  stream:boolean;
  temperature:number;
  messages:Array<Messages>;
}

export interface ModelDetails  {
  format:string;
  family:string;
  families:Array<string>;
  parameter_size:string;
  quantization_level:string;
}

export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest:string;
  details:ModelDetails;
}

export interface Models {
  models:Array<Model>;
}

export interface ModelRedux {
  index:number;
  name: string;
  parameter_size:string;
  quantization_level:string;
}

export interface Answer {
  postData: Prompt;
}

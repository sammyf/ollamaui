import { Injectable } from '@angular/core';
import { Persona } from '../models/ollama.models';
import { Personas } from '../assets/data/personas';

@Injectable({
  providedIn: 'root',
})
export class PersonasService {
  constructor() {}
  getAllPersonas(): Array<Persona> {
    return Personas;
  }
}

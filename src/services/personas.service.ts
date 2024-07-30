import { Injectable } from '@angular/core';
import { Persona } from '../models/ollama.models';
import { mockPersonas } from '../mocks/mockPersonas';

@Injectable({
  providedIn: 'root',
})
export class PersonasService {
  personasJson: string = mockPersonas;

  personas: Array<Persona> = JSON.parse(this.personasJson);
  constructor() {}
  getAllPersonas(): Array<Persona> {
    return this.personas;
  }
}

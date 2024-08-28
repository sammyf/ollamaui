import { TestBed } from '@angular/core/testing';
import { PersonasService } from './personas.service';
import { Persona } from '../models/ollama.models';
import { mockPersonas } from '../assets/data/personas';

describe('PersonasService', () => {
  let service: PersonasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPersonas', () => {
    it('should return an empty array when no personas are available', () => {
      // Arrange
      const expectedResult: Array<Persona> = JSON.parse(mockPersonas);

      // Act
      const result = service.getAllPersonas();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should return the same array of personas as provided', () => {
      // Arrange
      const mockPersonas: Array<Persona> = [
        { name: 'John', context: 'private', speaker:'male', role: 'admin' },
        { name: 'Jane', context: 'private', speaker:'female', role: 'admin' },
      ];
      service.personas = mockPersonas;

      // Act
      const result = service.getAllPersonas();

      // Assert
      expect(result).toEqual(mockPersonas);
    });

    it('should return a new array with the same elements when called multiple times', () => {
      // Arrange
      const mockPersonas: Array<Persona> = [
        { name: 'John', context: 'private', speaker:'male', role: 'admin' },
        { name: 'Jane', context: 'private', speaker:'female', role: 'admin' },
      ];
      service.personas = mockPersonas;

      // Act
      const result1 = service.getAllPersonas();
      const result2 = service.getAllPersonas();

      // Assert
      expect(result1).toEqual(result2);
    });
  });
});

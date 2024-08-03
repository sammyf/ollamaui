import { Injectable } from '@angular/core';
import {JsonParseOptions} from "nx/src/utils/json";
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CookieStorageService {
  DomainName: string = environment.serverUrl.replace(/^https?:\/\//, '');

  constructor() {
  }

  // Set a value in local storage
  setItem(key: string, value: string): void {
    const cookie = key + "=" + value + ";SameSite=None;"
    document.cookie = cookie;
  }

  // Get a value from local storage
  getItem(key: string): string | null {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(key + "="))
      ?.split("=")[1];

    return cookieValue ?? "[]";
  }

  // Remove a value from local storage
  removeItem(key: string): void {
    this.setItem(key, "");
  }
}

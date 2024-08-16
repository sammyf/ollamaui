import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment.prod";
import {lastValueFrom} from "rxjs";
import {LoginData, LoginResult} from "../models/login.models";
import {resolve} from "@angular/compiler-cli";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {
  }
  url: string = `${environment.companionUrl}/companion`;

  async Login(data:LoginData):Promise<LoginResult> {
    try{
      const response:LoginResult = await lastValueFrom(
        this.http.post<LoginResult>(
          `${environment.companionUrl}/async/login?cache=${Math.floor(Math.random() * 10000000)}`,
          data,
          {
            responseType: 'json',
          }
        )
      );
      return response
    } catch (error) {
      console.error(error);
      return { result: false, csrfToken: 'No TTS Answer.'};
    }
  }
}

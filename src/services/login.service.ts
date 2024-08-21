import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment.prod";
import {lastValueFrom} from "rxjs";
import {LoginData, LoginResult} from "../models/login.models";
import {resolve} from "@angular/compiler-cli";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {
  constructor(private http: HttpClient, private localStorage: LocalStorageService) {
  }
  url: string = `${environment.companionUrl}/companion`;

  async ngOnInit() {
    let csrfToken = this.localStorage.getItem('csrfToken');
    if (csrfToken) {
     await this.LoginByCsrf(csrfToken);
    }
  }

  async LoginByCsrf(csrfToken:string):Promise<LoginResult> {
    try{
      const response:LoginResult = await lastValueFrom(
        this.http.post<LoginResult>(
          `${environment.companionUrl}/async/loginByCsrf?cache=${Math.floor(Math.random() * 10000000)}`,
          {
            csrf_token: csrfToken
          },
          {
            responseType: 'json',
          }
        )
      );
      return response
    } catch (error) {
      console.error(error);
      this.localStorage.removeItem('csrfToken');
      return { result: false, csrf_token: 'Error Login In'};
    }
  }

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
      return { result: false, csrf_token: 'Error Login In'};
    }
  }
}

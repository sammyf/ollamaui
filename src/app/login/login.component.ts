import {Component, Injectable, Input, OnInit} from '@angular/core';
import { LoginService } from '../../services/login.service'; // You might need to adjust the path
import { LoginResult } from '../../models/login.models'; // You might need to adjust the path
import { Router } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {CookieStorageService} from "../../services/cookie-storage.service";

@Injectable({providedIn: 'root'})
@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  standalone: true
})
export class LoginComponent implements OnInit{
  username: string = ""
  password: string = "";
  doLogin: boolean = true;

  constructor(private loginService: LoginService, private router: Router, private cookieStorage: CookieStorageService) {
  }

  ngOnInit(){
    this.cookieStorage.removeItem("csrfToken");
    this.doLogin = true;
  }
  async login() {
    try {
      const data: LoginResult = await this.loginService.Login({ username: this.username, password: this.password});
      if (data.result) {
        this.cookieStorage.setItem("csrfToken",data.csrf_token);
        this.cookieStorage.setItem("username", this.username)
        this.doLogin = false;
        this.router.navigate(['/input_box'], {skipLocationChange: true});
      } else {
        console.log('Login error');
      }
    } catch (error) {
      console.log('Login error');
    }
  }
}

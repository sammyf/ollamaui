import {Component, Injectable} from '@angular/core';
import { LoginService } from '../../services/login.service'; // You might need to adjust the path
import { LoginResult } from '../../models/login.models'; // You might need to adjust the path
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true
})
export class LoginComponent {
  username: string = "";
  password: string = "";

  constructor(private loginService: LoginService, private router: Router) {
  }

  async login() {
    try {
      const data: LoginResult = await this.loginService.Login({ username: this.username, password: this.password});
      if (data.result) {
        this.router.navigate(['/input_box', { csrfToken: data.csrfToken }]);
      } else {
        console.log('Login error');
      }
    } catch (error) {
      console.log('Login error');
    }
  }
}

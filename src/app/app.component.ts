import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {InputBoxComponent} from "./inputbox/inputbox.component";
import {FormsModule} from "@angular/forms";
import {LoginComponent} from "./login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InputBoxComponent,LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ollamaui';
}

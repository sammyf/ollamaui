import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {InputBoxComponent} from "./inputbox.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InputBoxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ollamaui';
}

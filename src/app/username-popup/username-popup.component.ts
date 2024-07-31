import {Component, EventEmitter, Input, output, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-username-popup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './username-popup.component.html',
  styleUrl: './username-popup.component.css'
})
export class UsernamePopupComponent {
  usernameChange = output<string>();
  @Input() username: string = "Sqwaking Seagull";

  KeyUp() {
    // @ts-ignore
    console.log("box:"+this.username);
    this.usernameChange.emit(this.username);
  }
}

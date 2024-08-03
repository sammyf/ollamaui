import {Component, EventEmitter, Input, output, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UtilsService} from "../../services/utils.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-username-popup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './username-popup.component.html',
  styleUrl: './username-popup.component.css',
})
export class UsernamePopupComponent {
  @Input() showme = true;
  constructor(private utilsService: UtilsService) {
  }
  username:string = "";
  ngOnInit(): void {
    this.username = this.utilsService.GetUsername();
    if (this.username !== null || this.username !== "") {
      this.showme = false;
    }
  }

  StoreName() {
    this.utilsService.SetUsername(this.username);
    this.showme = false;
  }
}

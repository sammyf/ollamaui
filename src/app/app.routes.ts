import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import your InputBoxComponent
// @ts-ignore
import { InputBoxComponent } from './inputbox/inputbox.component';
import {LoginComponent} from "./login/login.component";
import {fullChatComponent} from "./full_chat/full_chat.component";

export const routes: Routes = [
  { path: '', component: InputBoxComponent },
  { path: 'input_box', component: InputBoxComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chatlog', component: fullChatComponent}// other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

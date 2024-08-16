import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import your InputBoxComponent
// @ts-ignore
import { InputBoxComponent } from './inputbox/inputbox.component';

export const routes: Routes = [
  { path: 'input_box', component: InputBoxComponent },
  // other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

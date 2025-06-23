import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    CommonModule ,// Exporting CommonModule to use common directives like ngIf, ngFor, etc.
    RouterModule, // Exporting RouterModule to use routing features in other modules
  ],
})
export class SharedModule { }

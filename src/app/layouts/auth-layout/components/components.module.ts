import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthHeaderComponent } from './auth-header/auth-header.component';
import { AuthFooterComponent } from './auth-footer/auth-footer.component';



@NgModule({
  declarations: [
    AuthHeaderComponent,
    AuthFooterComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ComponentsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';



@NgModule({
  declarations: [],
  providers: [
    AuthGuard,
    AdminGuard,
    NoAuthGuard
  ],
  imports: [
    CommonModule
  ]
})
export class CoreModule { }

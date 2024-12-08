// src/app/layouts/layouts.module.ts
import { NgModule } from '@angular/core';
import { AuthLayoutModule } from './auth-layout/auth-layout.module';
import { MainLayoutModule } from './main-layout/main-layout.module';

@NgModule({
  imports: [
    MainLayoutModule,
    AuthLayoutModule
  ],
  exports: [
    MainLayoutModule,
    AuthLayoutModule
  ]
})
export class LayoutsModule { }
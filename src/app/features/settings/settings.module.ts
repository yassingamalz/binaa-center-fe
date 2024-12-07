import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { CenterSettingsComponent } from './components/center-settings/center-settings.component';



@NgModule({
  declarations: [
    UserSettingsComponent,
    CenterSettingsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SettingsModule { }

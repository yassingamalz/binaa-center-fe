
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { CenterSettingsComponent } from './components/center-settings/center-settings.component';
import { SharedModule } from '../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'center',
    pathMatch: 'full'
  },
  {
    path: 'center',
    component: UnderConstructionComponent
  },
  {
    path: 'user',
    component: UserSettingsComponent
  }
];

@NgModule({
  declarations: [
    UserSettingsComponent,
    CenterSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule
  ]
})
export class SettingsModule { }
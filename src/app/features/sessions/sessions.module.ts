import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { SessionFormComponent } from './components/session-form/session-form.component';



@NgModule({
  declarations: [
    SessionListComponent,
    SessionDetailsComponent,
    SessionFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SessionsModule { }

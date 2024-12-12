import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionDetailsComponent } from './components/session-details/session-details.component';
import { SessionFormComponent } from './components/session-form/session-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';


const routes = [
  {
    path: '',
    component: SessionListComponent
  },
  {
    path: ':id',
    component: SessionDetailsComponent
  },
  {
    path: ':new',
    component: SessionFormComponent
  }
];

@NgModule({
  declarations: [
    SessionListComponent,
    SessionDetailsComponent,
    SessionFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ],
})
export class SessionsModule { }

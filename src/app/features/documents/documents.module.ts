
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { SharedModule } from '../../shared/shared.module';

const routes = [
  {
    path: '',
    component: DocumentListComponent
  }
];

@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentUploadComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ],
  exports: [
    DocumentListComponent,
    DocumentUploadComponent
  ]
})
export class DocumentsModule { }
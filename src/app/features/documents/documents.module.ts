import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';



@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentUploadComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DocumentsModule { }

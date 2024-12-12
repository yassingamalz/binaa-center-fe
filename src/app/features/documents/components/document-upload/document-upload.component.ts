// document-upload.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { CaseDTO } from '../../../../core/models/case';
import { CaseService } from '../../../cases/services/case.service';
import { DocumentService } from '../../services/document.service';
import { DocumentType } from '../../../../core/models/document';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  cases: CaseDTO[] = [];
  
  documentTypes = [
    { value: DocumentType.MEDICAL, label: 'تقارير طبية' },
    { value: DocumentType.ASSESSMENT, label: 'تقارير تقييم' },
    { value: DocumentType.PROGRESS_REPORT, label: 'تقارير متابعة' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private documentService: DocumentService,
    private caseService: CaseService,
    private toastr: ToastrService
  ) {
    this.uploadForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCases();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: ['', Validators.required],
      type: [DocumentType.MEDICAL, Validators.required],
      description: ['']
    });
  }

  private loadCases(): void {
    this.caseService.getAllActiveCases().subscribe({
      next: (cases) => this.cases = cases,
      error: (error) => {
        console.error('Error loading cases:', error);
        this.toastr.error('حدث خطأ أثناء تحميل قائمة الحالات');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('caseId', this.uploadForm.get('caseId')?.value);
    formData.append('type', this.uploadForm.get('type')?.value);
    formData.append('description', this.uploadForm.get('description')?.value || '');

    this.isUploading = true;
    this.documentService.uploadDocument(formData)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (result) => {
          this.activeModal.close(result);
          this.toastr.success('تم رفع المستند بنجاح');
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.toastr.error('حدث خطأ أثناء رفع المستند');
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.uploadForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.uploadForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
    }
    return '';
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}

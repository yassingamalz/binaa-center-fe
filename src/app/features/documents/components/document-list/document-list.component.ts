// document-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { DocumentDTO, DocumentResponseDTO, DocumentType } from '../../../../core/models/document';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: DocumentResponseDTO[] = [];
  filteredDocuments: DocumentResponseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;

  selectedType: DocumentType | 'all' = 'all';
 
  documentTypes: { value: DocumentType | 'all', label: string }[] = [
    { value: 'all', label: 'الكل' },
    { value: DocumentType.MEDICAL, label: 'تقارير طبية' },
    { value: DocumentType.ASSESSMENT, label: 'تقارير تقييم' },
    { value: DocumentType.PROGRESS_REPORT, label: 'تقارير متابعة' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocuments();
    this.setupSearchListener();
  }

  private setupSearchListener(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterDocuments();
      });
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.documents = documents;
          this.filterDocuments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المستندات');
          this.isLoading = false;
        }
      });
  }

  filterDocuments(): void {
    let filtered = [...this.documents];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();
  
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm) ||
        doc.caseId?.toString().includes(searchTerm)
      );
    }
  
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === this.selectedType);
    }
  
    this.filteredDocuments = filtered;
  }

  uploadDocument(): void {
    const modalRef = this.modalService.open(DocumentUploadComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadDocuments();
          this.toastr.success('تم رفع المستند بنجاح');
        }
      },
      () => { } // Modal dismissed
    );
  }

  downloadDocument(document: DocumentDTO): void {
    this.documentService.downloadDocument(document.documentId)
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = document.filePath;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Error downloading document:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المستند');
        }
      });
  }

  deleteDocument(document: DocumentDTO, event: Event): void {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      this.documentService.deleteDocument(document.documentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadDocuments();
            this.toastr.success('تم حذف المستند بنجاح');
          },
          error: (error) => {
            console.error('Error deleting document:', error);
            this.toastr.error('حدث خطأ أثناء حذف المستند');
          }
        });
    }
  }

  getDocumentTypeLabel(type: DocumentType): string {
    const found = this.documentTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  onTypeChange(type: 'all' | DocumentType): void {
    this.selectedType = type;
    this.filterDocuments();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AssessmentType, AssessmentStatus } from '../../../../core/models/assessment';

@Component({
  selector: 'app-assessment-form',
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.scss']
})
export class AssessmentFormComponent implements OnInit {
  assessmentForm!: FormGroup; // Using the definite assignment operator
  isSubmitting = false;

  assessmentTypes = [
    { value: AssessmentType.IQ, label: 'تقييم الذكاء' },
    { value: AssessmentType.PSYCHOLOGICAL, label: 'تقييم نفسي' },
    { value: AssessmentType.LEARNING_DIFFICULTIES, label: 'تقييم صعوبات التعلم' }
  ];

  // Custom fields for each assessment type
  iqFields = [
    { key: 'verbalComprehension', label: 'الفهم اللفظي' },
    { key: 'perceptualReasoning', label: 'الاستدلال الإدراكي' },
    { key: 'workingMemory', label: 'الذاكرة العاملة' },
    { key: 'processingSpeed', label: 'سرعة المعالجة' }
  ];

  psychologicalFields = [
    { key: 'emotionalState', label: 'الحالة العاطفية' },
    { key: 'behavioralObservations', label: 'الملاحظات السلوكية' },
    { key: 'socialSkills', label: 'المهارات الاجتماعية' },
    { key: 'adaptiveBehavior', label: 'السلوك التكيفي' }
  ];

  learningFields = [
    { key: 'readingAbility', label: 'القدرة على القراءة' },
    { key: 'writingSkills', label: 'مهارات الكتابة' },
    { key: 'mathematicalSkills', label: 'المهارات الحسابية' },
    { key: 'attentionSpan', label: 'مدى الانتباه' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.createForm();
    // Listen for assessment type changes
    this.assessmentForm.get('assessmentType')?.valueChanges
      .subscribe(type => {
        this.updateFormFields(type);
      });
  }

  private createForm(): void {
    this.assessmentForm = this.fb.group({
      assessmentType: ['', Validators.required],
      caseId: ['', Validators.required],
      assessmentDate: [new Date(), Validators.required],
      assessorId: ['', Validators.required],
      score: [''],
      recommendations: [''],
      status: [AssessmentStatus.PENDING],
      nextAssessmentDate: [''],
      // Dynamic fields will be added based on type
      assessmentFields: this.fb.group({})
    });
  }

  private updateFormFields(type: AssessmentType): void {
    const fieldsGroup = this.assessmentForm.get('assessmentFields') as FormGroup;
    
    // Clear existing fields
    Object.keys(fieldsGroup.controls).forEach(key => {
      fieldsGroup.removeControl(key);
    });

    // Add new fields based on type
    let fields: { key: string, label: string }[] = [];
    switch (type) {
      case AssessmentType.IQ:
        fields = this.iqFields;
        break;
      case AssessmentType.PSYCHOLOGICAL:
        fields = this.psychologicalFields;
        break;
      case AssessmentType.LEARNING_DIFFICULTIES:
        fields = this.learningFields;
        break;
    }

    fields.forEach(field => {
      fieldsGroup.addControl(field.key, this.fb.control(''));
    });
  }

  getTypeSpecificFields(): { key: string, label: string }[] {
    const type = this.assessmentForm.get('assessmentType')?.value;
    switch (type) {
      case AssessmentType.IQ:
        return this.iqFields;
      case AssessmentType.PSYCHOLOGICAL:
        return this.psychologicalFields;
      case AssessmentType.LEARNING_DIFFICULTIES:
        return this.learningFields;
      default:
        return [];
    }
  }

  onSubmit(): void {
    if (this.assessmentForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assessmentForm.value;
    
    // Combine base data with type-specific fields
    const assessmentData = {
      ...formValue,
      typeSpecificData: formValue.assessmentFields
    };

    this.activeModal.close(assessmentData);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  // Helper for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.assessmentForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
}
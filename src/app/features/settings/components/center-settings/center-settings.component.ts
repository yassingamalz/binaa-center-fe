import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-center-settings',
  templateUrl: './center-settings.component.html',
  styleUrls: ['./center-settings.component.scss']
})
export class CenterSettingsComponent implements OnInit {
  centerForm: FormGroup;
  workingHoursForm: FormGroup;
  isLoading = false;
  isSaving = false;

  workingDays = [
    { id: 'sunday', label: 'الأحد' },
    { id: 'monday', label: 'الإثنين' },
    { id: 'tuesday', label: 'الثلاثاء' },
    { id: 'wednesday', label: 'الأربعاء' },
    { id: 'thursday', label: 'الخميس' },
    { id: 'friday', label: 'الجمعة' },
    { id: 'saturday', label: 'السبت' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastr: ToastrService
  ) {
    this.centerForm = this.createCenterForm();
    this.workingHoursForm = this.createWorkingHoursForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private createCenterForm(): FormGroup {
    return this.fb.group({
      centerName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      taxNumber: [''],
      website: [''],
      description: [''],
      logo: [null]
    });
  }

  private createWorkingHoursForm(): FormGroup {
    return this.fb.group({
      workingDays: this.fb.group(
        this.workingDays.reduce((acc, day) => ({
          ...acc,
          [day.id]: [false]
        }), {})
      ),
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      sessionDuration: [60, [Validators.required, Validators.min(15)]],
      breakTime: [30, [Validators.required, Validators.min(0)]]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getCenterSettings().subscribe({
      next: (settings) => {
        this.centerForm.patchValue(settings.centerInfo);
        this.workingHoursForm.patchValue(settings.workingHours);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.toastr.error('حدث خطأ أثناء تحميل الإعدادات');
        this.isLoading = false;
      }
    });
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toastr.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }
      this.centerForm.patchValue({ logo: file });
    }
  }

  onSubmit(): void {
    if (this.centerForm.invalid || this.workingHoursForm.invalid) {
      Object.keys(this.centerForm.controls).forEach(key => {
        const control = this.centerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      Object.keys(this.workingHoursForm.controls).forEach(key => {
        const control = this.workingHoursForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSaving = true;
    const settings = {
      centerInfo: this.centerForm.value,
      workingHours: this.workingHoursForm.value
    };

    this.settingsService.updateCenterSettings(settings).subscribe({
      next: () => {
        this.toastr.success('تم حفظ الإعدادات بنجاح');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.toastr.error('حدث خطأ أثناء حفظ الإعدادات');
        this.isSaving = false;
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (control.errors['pattern']) return 'رقم الهاتف غير صحيح';
      if (control.errors['min']) return 'القيمة أقل من المسموح';
    }
    return '';
  }
}
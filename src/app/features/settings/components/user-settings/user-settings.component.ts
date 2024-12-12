import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isSaving = false;
  isChangingPassword = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      role: ['', Validators.required],
      avatar: [null],
      preferences: this.fb.group({
        notifications: [true],
        language: ['ar'],
        theme: ['light']
      })
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.settingsService.getUserProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('حدث خطأ أثناء تحميل البيانات الشخصية');
        this.isLoading = false;
      }
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.toastr.error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
        return;
      }
      this.profileForm.patchValue({ avatar: file });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSaving = true;
    this.settingsService.updateUserProfile(this.profileForm.value).subscribe({
      next: () => {
        this.toastr.success('تم تحديث البيانات الشخصية بنجاح');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastr.error('حدث خطأ أثناء تحديث البيانات الشخصية');
        this.isSaving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isChangingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.settingsService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toastr.success('تم تغيير كلمة المرور بنجاح');
        this.passwordForm.reset();
        this.isChangingPassword = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.toastr.error(
          error?.error?.message || 'حدث خطأ أثناء تغيير كلمة المرور'
        );
        this.isChangingPassword = false;
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
      if (control.errors['pattern']) {
        if (fieldName === 'phone') return 'رقم الهاتف غير صحيح';
        if (fieldName === 'newPassword') return 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص';
      }
      if (control.errors['minlength']) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      if (control.errors['mismatch']) return 'كلمة المرور غير متطابقة';
    }
    return '';
  }
}
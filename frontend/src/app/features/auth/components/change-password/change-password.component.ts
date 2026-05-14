import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ResumeService } from '../../../job-seeker/services/resume.service';
import { AuthService } from '../../../../core/services/auth.service';
 
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50">
  <app-navbar />

  <!-- Toast --> 
  <div *ngIf="toastMessage" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 min-w-80">
    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl shrink-0">✅</div>
    <div>
      <p class="font-semibold text-gray-900 text-sm">{{ toastMessage }}</p>
      <p class="text-xs text-gray-400 mt-0.5">{{ toastSub }}</p>
    </div>
    <button (click)="toastMessage = ''" class="ml-auto text-gray-300 hover:text-gray-500 text-xl leading-none">&times;</button>
  </div>

  <main class="flex-1 flex items-start justify-center px-6 py-12">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">🔒</div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Change Password</h1>
          <p class="text-xs text-gray-400">Update your account password</p>
        </div>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5">{{ error }}</div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input [(ngModel)]="newPassword" type="password" placeholder="At least 6 characters"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label> 
          <input [(ngModel)]="confirmPassword" type="password" placeholder="Re-enter new password"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
 
      <button (click)="changePassword()" [disabled]="saving" 
        class="w-full mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-50">
        {{ saving ? 'Updating...' : 'Update Password' }}
      </button>

      <button (click)="goBack()" class="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 text-center">
        ← Go Back
      </button>
    </div>
  </main>
  <app-footer />
</div>
  `
})
export class ChangePasswordComponent {

  newPassword = '';
  confirmPassword = '';
  saving = false;
  error = '';
  toastMessage = '';
  toastSub = '';
  profile: any = null;

  constructor(
    private resumeService: ResumeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.resumeService.getProfile().subscribe({
      next: (res) => { this.profile = res; }
    });
  }

  changePassword() {
    this.error = '';
    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (!this.profile) {
      this.error = 'Could not load profile. Please try again.';
      return;
    }
    this.saving = true;
    this.resumeService.updateProfile(this.profile.id, { 
      name: this.profile.name, 
      password: this.newPassword 
    }).subscribe({
      next: () => {
        this.saving = false;
        this.newPassword = '';
        this.confirmPassword = '';
        this.toastMessage = 'Password updated!';
        this.toastSub = 'Your password has been changed successfully.';
        this.cdr.detectChanges();
        setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to update password.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    const role = this.authService.getRole(); 
    if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
    else if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/profile']);
  }
}

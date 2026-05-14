import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ResumeService } from '../../services/resume.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, ConfirmModalComponent],
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

  <main class="flex-1 max-w-3xl mx-auto w-full px-6 py-8">

    <!-- Avatar + Name header -->
    <div class="flex items-center gap-4 mb-8">
      <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
        {{ initials }}
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ profile?.name || email }}</h1>
        <p class="text-sm text-gray-400">{{ email }}</p> 
        <span class="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block">{{ role }}</span>
      </div>
    </div>

    <div *ngIf="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>

    <div *ngIf="!loading" class="space-y-5">

      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <h2 class="font-bold text-gray-900 mb-5">Personal Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input [(ngModel)]="name" type="text" placeholder="Your full name"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">About Me</label>
            <input [(ngModel)]="headline" type="text" placeholder="e.g. Passionate developer with 3 years of experience..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input [value]="email" type="text" disabled 
              class="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            <p class="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
            <input [(ngModel)]="mobile" type="tel" placeholder="e.g. +91 9876543210"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button (click)="saveProfile()" [disabled]="saving"
          class="mt-5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition disabled:opacity-50">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Skills -->
      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <h2 class="font-bold text-gray-900 mb-4">Skills</h2>
        <div class="flex gap-2 mb-3">
          <input [(ngModel)]="skillInput" type="text" placeholder="e.g. React, Java, Python"
            (keydown.enter)="addSkill()"
            class="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button (click)="addSkill()"
            class="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Add</button>
        </div>
        <div *ngIf="skillList.length > 0" class="flex flex-wrap gap-2">
          <span *ngFor="let s of skillList"
            class="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
            {{ s }}
            <button (click)="removeSkill(s)" class="text-blue-400 hover:text-red-500 leading-none">&times;</button>
          </span>
        </div>
        <p *ngIf="skillList.length === 0" class="text-sm text-gray-400">No skills added yet. Add skills to improve your profile.</p>
        <button (click)="saveSkills()" [disabled]="!skillsDirty"
          class="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition disabled:opacity-50">
          Save Skills
        </button>
      </div> 

      <!-- Quick Links -->
      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <h2 class="font-bold text-gray-900 mb-4">Quick Links</h2>
        <div class="grid grid-cols-2 gap-3">
          <button (click)="router.navigate(['/resume'])"
            class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <span class="text-2xl">📄</span>
            <div>
              <p class="text-sm font-semibold text-gray-800">Resume</p>
              <p class="text-xs text-gray-400">Manage your resume</p>
            </div>
          </button>
          <button (click)="router.navigate(['/applications'])"
            class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <span class="text-2xl">📋</span>
            <div>
              <p class="text-sm font-semibold text-gray-800">Applications</p>
              <p class="text-xs text-gray-400">Track your applications</p>
            </div>
          </button>
          <button (click)="router.navigate(['/change-password'])"
            class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <span class="text-2xl">🔒</span>
            <div>
              <p class="text-sm font-semibold text-gray-800">Change Password</p>
              <p class="text-xs text-gray-400">Update your password</p>
            </div>
          </button>
          <button (click)="router.navigate(['/jobs'])"
            class="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <span class="text-2xl">💼</span>
            <div>
              <p class="text-sm font-semibold text-gray-800">Browse Jobs</p>
              <p class="text-xs text-gray-400">Find your next role</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Account -->
      <div class="bg-white rounded-xl border border-red-100 p-6">
        <h2 class="font-bold text-gray-900 mb-1">Account</h2>
        <p class="text-xs text-gray-400 mb-4">Manage your account session</p>
        <button (click)="showLogoutModal = true"
          class="flex items-center gap-2 text-red-500 border border-red-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-50 transition">
          🚪 Sign Out
        </button>
      </div>

    </div>
  </main>
  <app-footer />
</div>

<app-confirm-modal
  [visible]="showLogoutModal"
  (confirmed)="doLogout()"
  (cancelled)="showLogoutModal = false">
</app-confirm-modal>
  `
})
export class MyProfileComponent implements OnInit {

  profile: any = null;
  loading = true;
  saving = false;
  name = '';
  toastMessage = '';
  toastSub = '';
  resumes: any[] = [];
  headline = '';
  skills = '';
  mobile = '';
  skillList: string[] = [];
  skillInput = '';
  skillsDirty = false;

  constructor(
    public router: Router,
    private resumeService: ResumeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get email() { return this.authService.getEmail() || ''; }
  get role() { return this.authService.getRole() || ''; }
  get initials() { return this.email ? this.email.substring(0, 2).toUpperCase() : 'U'; }

  ngOnInit() {
    this.resumeService.getProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.name = res.name || '';
        this.headline = res.headline || '';
        this.skills = res.skills || '';
        this.skillList = this.skills ? this.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        this.mobile = res.mobile || '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
    this.resumeService.getMyResumes().subscribe({
      next: (res) => { this.resumes = Array.isArray(res) ? res : (res.content || []); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  saveProfile() { 
    if (!this.profile || !this.name.trim()) return;
    this.saving = true;
    this.resumeService.updateProfile(this.profile.id, {
      name: this.name.trim(),
      mobile: this.mobile.trim(),
      headline: this.headline.trim(),
      skills: this.skillList.join(', ')
    }).subscribe({
      next: () => {
        this.saving = false;
        this.profile.name = this.name.trim();
        this.showToast('Profile updated!', 'Your details have been saved.');
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); }
    });
  }

  addSkill() {
    const s = this.skillInput.trim();
    if (!s || this.skillList.includes(s)) return; 
    this.skillList = [...this.skillList, s];
    this.skillInput = '';
    this.skillsDirty = true;
    this.cdr.detectChanges();
  }

  removeSkill(skill: string) {
    this.skillList = this.skillList.filter(s => s !== skill);
    this.skillsDirty = true; 
    this.cdr.detectChanges();
  }

  saveSkills() {
    if (!this.profile) return;
    this.resumeService.updateProfile(this.profile.id, {
      name: this.name.trim() || this.profile.name,
      mobile: this.mobile.trim(),
      headline: this.headline.trim(),
      skills: this.skillList.join(', ')
    }).subscribe({
      next: () => {
        this.skillsDirty = false;
        this.showToast('Skills saved!', 'Your skills have been updated.');
      },
      error: () => this.cdr.detectChanges()
    });
  }

  showToast(message: string, sub: string) {
    this.toastMessage = message;
    this.toastSub = sub;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  showLogoutModal = false;
  doLogout() { this.authService.logout(); }
}

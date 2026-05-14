import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { LucideAngularModule, User, Building2 } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
  <div class="flex flex-col items-center mb-6">
    <div class="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mb-4">
      <span class="text-white text-xl font-bold">J</span>
    </div>
    <h1 class="text-2xl font-bold text-gray-900">Create your account</h1>
    <p class="text-gray-500 text-sm mt-1">Join the professional community and take the next step in your career</p>
  </div> 

  <div class="bg-white rounded-2xl shadow-md w-full max-w-lg p-8">
    <p class="text-sm font-medium text-gray-700 mb-3">I want to use this platform to...</p>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <button type="button" (click)="selectRole('JOB_SEEKER')"
        [class]="selectedRole === 'JOB_SEEKER' ? 'border-2 border-blue-600 bg-blue-50 rounded-xl p-3 text-center' : 'border border-gray-200 rounded-xl p-3 text-center hover:bg-gray-50'">
        <div class="mb-1 flex justify-center text-blue-700"><lucide-icon [img]="UserIcon" [size]="28"></lucide-icon></div>
        <div class="text-sm font-semibold text-gray-800">Find a Job</div>
        <div class="text-xs text-gray-500">I'm a Job Seeker</div>
      </button>
      <button type="button" (click)="selectRole('RECRUITER')"
        [class]="selectedRole === 'RECRUITER' ? 'border-2 border-blue-600 bg-blue-50 rounded-xl p-3 text-center' : 'border border-gray-200 rounded-xl p-3 text-center hover:bg-gray-50'">
        <div class="mb-1 flex justify-center text-blue-700"><lucide-icon [img]="BuildingIcon" [size]="28"></lucide-icon></div>
        <div class="text-sm font-semibold text-gray-800">Hire Talent</div>
        <div class="text-xs text-gray-500">I'm a Recruiter</div>
      </button>
    </div>

    <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{{ error }}</div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <p class="text-sm font-semibold text-gray-800 mb-3">Personal Details</p>

      <div class="mb-3">
        <label class="block text-xs text-gray-600 mb-1">Full Name</label>
        <input formControlName="name" type="text" placeholder="e.g. Jane Doe"
          [class]="'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (submitted && form.get('name').invalid ? 'border-red-400 bg-red-50' : 'border-gray-300')" />
        <p *ngIf="submitted && form.get('name').invalid" class="text-xs text-red-500 mt-1">Full name is required</p>
      </div>

      <div class="mb-3">
        <label class="block text-xs text-gray-600 mb-1">Email Address</label>
        <input formControlName="email" type="email" placeholder="jane.doe@example.com"
          [class]="'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (submitted && form.get('email').invalid ? 'border-red-400 bg-red-50' : 'border-gray-300')" />
        <p *ngIf="submitted && form.get('email').hasError('required')" class="text-xs text-red-500 mt-1">Email is required</p>
        <p *ngIf="submitted && form.get('email').hasError('email')" class="text-xs text-red-500 mt-1">Please enter a valid email address</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label class="block text-xs text-gray-600 mb-1">Password</label>
          <input formControlName="password" type="password" placeholder="Create password"
            [class]="'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (submitted && form.get('password').invalid ? 'border-red-400 bg-red-50' : 'border-gray-300')" />
          <p *ngIf="submitted && form.get('password').hasError('required')" class="text-xs text-red-500 mt-1">Password is required</p>
          <p *ngIf="submitted && form.get('password').hasError('minlength')" class="text-xs text-red-500 mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">Confirm Password</label>
          <input formControlName="confirmPassword" type="password" placeholder="Repeat password"
            [class]="'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (submitted && form.get('confirmPassword').invalid ? 'border-red-400 bg-red-50' : 'border-gray-300')" />
          <p *ngIf="submitted && form.get('confirmPassword').invalid" class="text-xs text-red-500 mt-1">Please confirm your password</p>
        </div>
      </div>

      <div class="flex items-start gap-2 mb-6">
        <input type="checkbox" [(ngModel)]="agreedToTerms" [ngModelOptions]="{standalone: true}" class="mt-0.5 rounded" /> 
        <p class="text-xs text-gray-500">
          By clicking Agree &amp; Join, you agree to the 
          <a href="#" class="text-blue-600 hover:underline">User Agreement</a>,
          <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>, and
          <a href="#" class="text-blue-600 hover:underline">Cookie Policy</a>.
        </p>
      </div>
      <p *ngIf="submitted && !agreedToTerms" class="text-xs text-red-500 -mt-4 mb-4">You must agree to the terms to continue</p>

      <button type="submit" [disabled]="loading"
        class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-full transition disabled:opacity-50">
        {{ loading ? 'Creating account...' : 'Agree & Join' }}
      </button>
    </form>
  </div>

  <p class="mt-6 text-sm text-gray-500">
    Already have an account?
    <a routerLink="/login" class="text-blue-600 font-semibold hover:underline">Sign in</a>
  </p>
</div>
  `
})
export class RegisterComponent {
  selectedRole = 'JOB_SEEKER';
  error = '';
  loading = false;
  form: any;
  agreedToTerms = false;
  submitted = false;

  UserIcon = User;
  BuildingIcon = Building2;
 
  constructor(
    private fb: FormBuilder,
    private authApi: AuthApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  } 

  selectRole(role: string) {
    if (role !== 'ADMIN') this.selectedRole = role;
  } 

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return; 
    if (this.form.value.password !== this.form.value.confirmPassword) { 
      this.error = 'Passwords do not match';  
      return;
    }
    if (!this.agreedToTerms) {
      this.error = 'You must agree to the terms to continue';
      return;
    }
    this.loading = true;
    this.error = '';
    const payload = {
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.selectedRole
    };
    this.authApi.register(payload).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}

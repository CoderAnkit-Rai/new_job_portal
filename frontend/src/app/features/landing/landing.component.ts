import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Compass, User, Building2, Zap, Search, FileText, Clipboard, Edit3, Users, Upload, Lock } from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
<div class="min-h-screen bg-white flex flex-col">

  <!-- Minimal Navbar -->
  <nav class="w-full px-8 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
    <div class="flex items-center gap-2 cursor-pointer" (click)="scrollToTop()">
      <div class="w-9 h-9 flex items-center justify-center">
        <lucide-icon [img]="CompassIcon" class="text-blue-700" [size]="32"></lucide-icon>
      </div>
      <span class="text-lg tracking-widest uppercase">
        <span class="font-black text-gray-900" style="letter-spacing:0.08em; text-shadow: 2px 2px 0px #cbd5e1">JOB</span><span class="font-black text-blue-700" style="letter-spacing:0.08em; text-shadow: 2px 2px 0px #bfdbfe">COMPASS</span><span class="text-blue-400 text-xs align-super ml-1">▲</span>
      </span>
    </div>
    <div class="flex items-center gap-3">
      <a routerLink="/login" class="text-sm font-medium text-gray-600 hover:text-blue-700 transition px-4 py-2 rounded-full hover:bg-gray-50">Sign In</a>
      <a routerLink="/register" class="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-5 py-2 rounded-full transition">Get Started</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 bg-gradient-to-b from-blue-50 to-white"> 
    <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase inline-flex items-center gap-2"><lucide-icon [img]="CompassIcon" [size]="14"></lucide-icon> Your Career Starts Here</span>
    <h1 class="text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
      Find Your <span class="text-blue-700">Dream Job</span><br/>or Hire Top Talent
    </h1>
    <p class="text-lg text-gray-500 max-w-xl mb-10">
      <span class="tracking-widest uppercase text-base"><span class="font-black text-gray-700" style="text-shadow:1px 1px 0 #cbd5e1">JOB</span><span class="font-black text-blue-700" style="text-shadow:1px 1px 0 #bfdbfe">COMPASS</span></span> connects ambitious job seekers with great companies. Apply in seconds, track your progress, and land the role you deserve.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a routerLink="/register"
        class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition shadow-lg shadow-blue-200">
        Find a Job →
      </a>
      <a routerLink="/register"
        class="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3.5 rounded-full text-sm transition">
        Post a Job →
      </a>
    </div>
  </section>

  <!-- Stats -->
  <section class="bg-blue-700 py-12">
    <div class="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center px-6">
      <div *ngFor="let stat of stats">
        <p class="text-3xl font-extrabold text-white">{{ stat.display }}</p>
        <p class="text-sm text-blue-200 mt-1">{{ stat.label }}</p>
      </div>
    </div>
  </section>

  <!-- For Job Seekers -->
  <section class="py-20 px-6 max-w-6xl mx-auto w-full">
    <div class="text-center mb-12">
      <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-wide inline-flex items-center gap-2"><lucide-icon [img]="UserIcon" [size]="14"></lucide-icon> For Job Seekers</span>
      <h2 class="text-3xl font-bold text-gray-900 mt-4">Everything you need to land your next role</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div *ngFor="let f of seekerFeatures" class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
        <div class="mb-4 text-blue-700"><lucide-icon [img]="f.icon" [size]="32"></lucide-icon></div>
        <h3 class="font-bold text-gray-900 mb-2">{{ f.title }}</h3>
        <p class="text-sm text-gray-500 leading-relaxed">{{ f.desc }}</p>
      </div>
    </div>
  </section>

  <!-- For Recruiters -->
  <section class="py-20 px-6 bg-gray-50">
    <div class="max-w-6xl mx-auto w-full">
      <div class="text-center mb-12">
        <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-wide inline-flex items-center gap-2"><lucide-icon [img]="BuildingIcon" [size]="14"></lucide-icon> For Recruiters</span>
        <h2 class="text-3xl font-bold text-gray-900 mt-4">Hire smarter, faster</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div *ngFor="let f of recruiterFeatures" class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div class="mb-4 text-blue-700"><lucide-icon [img]="f.icon" [size]="32"></lucide-icon></div>
          <h3 class="font-bold text-gray-900 mb-2">{{ f.title }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="py-20 px-6 max-w-5xl mx-auto w-full">
    <div class="text-center mb-14">
      <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-wide inline-flex items-center gap-2"><lucide-icon [img]="ZapIcon" [size]="14"></lucide-icon> How It Works</span>
      <h2 class="text-3xl font-bold text-gray-900 mt-4">Get started in 3 simple steps</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
      <div *ngFor="let step of steps; let i = index" class="flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-blue-200">
          {{ i + 1 }}
        </div>
        <h3 class="font-bold text-gray-900 mb-2">{{ step.title }}</h3>
        <p class="text-sm text-gray-500 leading-relaxed">{{ step.desc }}</p>
      </div>
    </div>
  </section>

  <!-- Bottom CTA -->
  <section class="bg-blue-700 py-20 px-6 text-center">
    <h2 class="text-3xl font-extrabold text-white mb-4">Ready to take the next step?</h2>
    <p class="text-blue-200 mb-8 text-sm max-w-md mx-auto">Join thousands of professionals who found their dream job or hired top talent through <span class="font-bold text-white">JobCompass</span>.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a routerLink="/register" class="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-full text-sm hover:bg-blue-50 transition shadow">
        Create Free Account
      </a>
      <a routerLink="/login" class="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:bg-blue-600 transition">
        Sign In
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 text-center text-xs text-gray-400 border-t border-gray-100">
    © 2026 <span class="tracking-widest uppercase font-black text-gray-600" style="text-shadow:1px 1px 0 #cbd5e1">JOB</span><span class="tracking-widest uppercase font-black text-red-600" style="text-shadow:1px 1px 0 #fecaca">COMPASS</span><span class="text-red-400 text-xs align-super">▲</span>. All rights reserved.
  </footer>

</div>
  `,
})
export class LandingComponent implements OnInit {

  constructor() {}

  CompassIcon = Compass;
  UserIcon = User;
  BuildingIcon = Building2;
  ZapIcon = Zap;
  SearchIcon = Search;
  FileTextIcon = FileText;
  ClipboardIcon = Clipboard;
  Edit3Icon = Edit3;
  UsersIcon = Users;
  UploadIcon = Upload;
  LockIcon = Lock;

  stats = [
    { display: '500+', label: 'Jobs Posted' },
    { display: '200+', label: 'Companies' },
    { display: '1,000+', label: 'Job Seekers' },
    { display: '350+', label: 'Hired' },
  ];

  ngOnInit() {}

  scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  seekerFeatures = [
    { icon: Search, title: 'Smart Job Search', desc: 'Filter by title, location, salary, and job type to find roles that match exactly what you\'re looking for.' },
    { icon: Zap, title: 'One-Click Apply', desc: 'Apply to jobs instantly with your saved profile and resume. No repetitive form filling.' },
    { icon: Clipboard, title: 'Track Applications', desc: 'See real-time status updates — Applied, Shortlisted, Interview, or Rejected — all in one place.' },
    { icon: FileText, title: 'Resume Builder', desc: 'Upload your resume and let our AI analyzer give you tips to improve it for better results.' },
  ];

  recruiterFeatures = [
    { icon: Edit3, title: 'Post Jobs Easily', desc: 'Create detailed job listings with title, description, salary, location, and job type in minutes.' },
    { icon: Users, title: 'Manage Applicants', desc: 'Review applicants, view their resumes and skills, and update their status with a single click.' },
    { icon: Upload, title: 'Export Data', desc: 'Download applicant data as CSV for offline review or sharing with your hiring team.' },
    { icon: Lock, title: 'Close & Reopen Jobs', desc: 'Control your listings — close a role when filled and reopen it anytime you need more candidates.' },
  ];

  steps = [
    { title: 'Create Your Account', desc: 'Sign up as a Job Seeker or Recruiter in under a minute. No credit card required.' },
    { title: 'Build Your Profile', desc: 'Add your skills, upload your resume, and complete your profile to stand out to recruiters.' },
    { title: 'Get Hired or Hire', desc: 'Apply to jobs and track your progress, or post roles and find your perfect candidate.' },
  ];
}

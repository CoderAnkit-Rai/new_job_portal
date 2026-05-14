import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RecruiterJobService } from '../../services/recruiter-job.service';
import { ApplicantService } from '../../services/applicant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50 ">
  <app-navbar />
  <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 ">Recruiter Overview</h1>
        <p class="text-sm text-gray-500  mt-1">Monitor your job postings, applicant pipeline, and key metrics.</p>
      </div>
      <div class="flex gap-3">

        <button (click)="postJob()" class="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center gap-2">
          + Post a Job
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white  rounded-xl border border-gray-100  p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500 ">Open Roles</p>
          <span class="text-blue-600 text-xl">💼</span>
        </div>
        <p *ngIf="!loading" class="text-3xl font-bold text-gray-900 ">{{ openRoles }}</p>
        <div *ngIf="loading" class="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
        <p class="text-xs text-green-500 mt-1">+2 this week</p>
      </div>
      <div class="bg-white  rounded-xl border border-gray-100  p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500 ">Total Applicants</p>
          <span class="text-blue-600 text-xl">👥</span>
        </div>
        <p *ngIf="!loading" class="text-3xl font-bold text-gray-900 ">{{ totalApplicants }}</p>
        <div *ngIf="loading" class="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
        <p class="text-xs text-green-500 mt-1">+124 this week</p>
      </div>
      <div class="bg-white  rounded-xl border border-gray-100  p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500 ">Shortlisted</p>
          <span class="text-yellow-500 text-xl">⭐</span>
        </div> 
        <p *ngIf="!loading" class="text-3xl font-bold text-gray-900 ">{{ shortlisted }}</p>
        <div *ngIf="loading" class="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
        <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Needs Review</span>
      </div>
      <div class="bg-white  rounded-xl border border-gray-100  p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-500 ">Interviews</p>
          <span class="text-purple-600 text-xl">📅</span>
        </div>
        <p *ngIf="!loading" class="text-3xl font-bold text-gray-900 ">{{ interviews }}</p>
        <div *ngIf="loading" class="w-16 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
        <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">This Week</span>
      </div> 
    </div>

    <!-- Recent Jobs -->
    <div class="bg-white  rounded-xl border border-gray-100  p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-900 ">Recent Job Postings</h2>
        <button (click)="viewMyJobs()" class="text-sm text-blue-600 hover:underline">View All</button>
      </div>

      <div *ngIf="loading" class="animate-pulse">
        <div class="flex gap-4 mb-3">
          <div *ngFor="let i of [1,2,3,4]" class="flex-1 h-3 bg-gray-200 rounded"></div>
        </div>
        <div *ngFor="let i of [1,2,3,4,5]" class="flex gap-4 py-3 border-b border-gray-50">
          <div class="flex-1 h-3 bg-gray-200 rounded"></div>
          <div class="w-16 h-5 bg-gray-200 rounded-full"></div>
          <div class="flex-1 h-3 bg-gray-200 rounded"></div>
          <div class="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div *ngIf="!loading && jobs.length === 0" class="text-center py-8 text-gray-400">
        <p>No jobs posted yet.</p>
        <button (click)="postJob()" class="mt-3 text-blue-600 text-sm hover:underline">Post your first job</button>
      </div>

      <div *ngIf="!loading && jobs.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 ">
            <tr>
              <th class="text-left text-xs font-semibold text-gray-500  uppercase px-4 py-3">Job Title</th>
              <th class="text-left text-xs font-semibold text-gray-500  uppercase px-4 py-3">Status</th>
              <th class="text-left text-xs font-semibold text-gray-500  uppercase px-4 py-3">Location</th>
              <th class="text-left text-xs font-semibold text-gray-500  uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 ">
            <tr *ngFor="let job of jobs.slice(0,5)" class="hover:bg-gray-50 :bg-gray-700">
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-gray-900 ">{{ job.title }}</p>
                <p class="text-xs text-gray-400">{{ job.company }}</p>
              </td>
              <td class="px-4 py-3">
                <span [ngClass]="job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                  class="text-xs font-semibold px-2.5 py-1 rounded-full">{{ job.status }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 ">{{ job.location }}</td>
              <td class="px-4 py-3">
                <button (click)="viewApplicants(job.jobId)" class="text-sm text-blue-600 hover:underline">View Applicants</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white  rounded-xl border border-gray-100  p-6">
      <h2 class="font-bold text-gray-900  mb-4">Quick Actions</h2>
      <div class="flex gap-3">
        <button (click)="postJob()" class="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 transition">
          + Post a New Job
        </button>
        <button (click)="viewMyJobs()" class="flex-1 border border-gray-200  text-gray-700  py-3 rounded-xl text-sm font-medium hover:bg-gray-50 :bg-gray-700 transition"> 
          📋 My Jobs 
        </button>
        <button (click)="viewApplicants(0)" class="flex-1 border border-gray-200  text-gray-700  py-3 rounded-xl text-sm font-medium hover:bg-gray-50 :bg-gray-700 transition">
          👥 All Applicants 
        </button>
      </div>
    </div>

  </main>
  <app-footer />
</div>
  `
})
export class DashboardComponent implements OnInit {

  jobs: any[] = [];
  loading = true;
  openRoles = 0;
  totalApplicants = 0;
  shortlisted = 0;
  interviews = 0;

  constructor(
    private recruiterJobService: RecruiterJobService,
    private applicantService: ApplicantService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadJobs(); }

  loadJobs() {
    this.loading = true;
    this.recruiterJobService.getMyJobs(0, 100).subscribe({
      next: (res) => {
        this.jobs = (res.content || res).slice(0, 5);
        const allJobs = res.content || res;
        this.openRoles = allJobs.filter((j: any) => j.status === 'OPEN').length;
        this.loading = false;
        this.loadApplicantStats(allJobs);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Dashboard jobs error:', err.status);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadApplicantStats(allJobs: any[]) {
    this.totalApplicants = 0;
    this.shortlisted = 0;
    this.interviews = 0;
    allJobs.forEach((job: any) => {
      this.applicantService.getApplicants(job.jobId, 0, 100).subscribe({
        next: (res) => {
          const apps = res.content || res;
          this.totalApplicants += res.totalElements || apps.length;
          this.shortlisted += apps.filter((a: any) => a.status === 'SHORTLISTED').length;
          this.interviews += apps.filter((a: any) => a.status === 'INTERVIEW_SCHEDULED').length;
          this.cdr.detectChanges();
        }
      });
    });
  }

  postJob() { this.router.navigate(['/recruiter/post-job']); }
  viewMyJobs() { this.router.navigate(['/recruiter/my-jobs']); }
  viewApplicants(jobId: number) { this.router.navigate(['/recruiter/applicants', jobId]); }
}

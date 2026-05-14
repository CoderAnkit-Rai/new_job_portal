import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ApplicantService } from '../../services/applicant.service';
import { RecruiterJobService } from '../../services/recruiter-job.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50">
  <app-navbar />
  <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <button (click)="router.navigate(['/recruiter/my-jobs'])" class="hover:text-blue-600">My Jobs</button>
      <span>›</span>
      <span class="text-gray-800 font-medium">Applicants Management</span>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Applicants Management</h1>
        <p class="text-sm text-gray-500 mt-1">{{ jobId ? 'Review and manage candidates for Job #' + jobId : 'All applicants across your job postings' }}</p> 
      </div>
      <div class="flex gap-3">
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center"> 
          <p class="text-2xl font-bold text-blue-700">{{ totalElements }}</p>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Total</p>
        </div> 
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center">
          <p class="text-2xl font-bold text-yellow-600">{{ shortlistedCount }}</p>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Shortlisted</p>
        </div>
      </div>
    </div>

    <!-- Filters --> 
    <div class="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex gap-3">
      <div class="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2"> 
        <span class="text-gray-400">🔍</span> 
        <input [(ngModel)]="searchTerm" type="text" placeholder="Search applicants..."
          class="text-sm outline-none w-full" />
      </div> 
      <select [(ngModel)]="statusFilter" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
        <option value="">All Statuses</option>
        <option value="APPLIED">Applied</option>
        <option value="SHORTLISTED">Shortlisted</option>
        <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="bg-white rounded-xl p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
    </div>

    <!-- Table -->
    <div *ngIf="!loading" class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100"> 
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Candidate</th>
            <th *ngIf="!jobId" class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Job</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Applied Date</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
          </tr> 
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr *ngFor="let app of filteredApplications" class="hover:bg-gray-50 transition cursor-pointer" (click)="openDetail(app)">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {{ app.userEmail?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ app.userEmail }}</p>
                  <p class="text-xs text-gray-400">Application #{{ app.applicationId?.substring(0,8) }}</p>
                </div>
              </div>
            </td> 
            <td *ngIf="!jobId" class="px-5 py-4">
              <p class="text-sm font-medium text-gray-800">{{ app.jobTitle || 'Job #' + app.jobId }}</p>
              <p class="text-xs text-gray-400">{{ app.jobCompany }}</p>  
            </td>
            <td class="px-5 py-4 text-sm text-gray-500">{{ app.appliedAt | date:'MMM dd, yyyy' }}</td>
            <td class="px-5 py-4">
              <span [class]="getStatusClass(app.status) + ' text-xs font-semibold px-3 py-1 rounded-full'">
                {{ getStatusLabel(app.status) }} 
              </span>
            </td>
            <td class="px-5 py-4">
              <select (click)="$event.stopPropagation()" (change)="updateStatus(app.applicationId, $event)"
                class="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="APPLIED" [selected]="app.status === 'APPLIED'">Applied</option>
                <option value="SHORTLISTED" [selected]="app.status === 'SHORTLISTED'">Shortlist</option>
                <option value="INTERVIEW_SCHEDULED" [selected]="app.status === 'INTERVIEW_SCHEDULED'">Schedule Interview</option>
                <option value="REJECTED" [selected]="app.status === 'REJECTED'">Reject</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table> 

      <!-- Empty -->
      <div *ngIf="filteredApplications.length === 0" class="text-center py-12 text-gray-400"> 
        <div class="text-4xl mb-3">👥</div> 
        <p class="font-medium">No applicants yet</p>
        <p class="text-sm mt-1">Applicants will appear here once they apply</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p class="text-sm text-gray-500">Showing {{ filteredApplications.length }} of {{ totalElements }}</p>
        <div class="flex gap-1">
          <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
            class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">&#8249;</button>
          <button *ngFor="let p of getPages()" (click)="goToPage(p)"
            [class]="currentPage === p ? 'px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm' : 'px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50'">
            {{ p + 1 }}
          </button>
          <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
            class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">&#8250;</button>
        </div>
      </div>
    </div>

  </main>
  <app-footer />
</div>

<!-- Applicant Detail Slide-over -->
<div *ngIf="selectedApplicant" class="fixed inset-0 z-50 flex justify-end">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/30" (click)="closeDetail()"></div>
  <!-- Panel -->
  <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
 
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 class="font-bold text-gray-900">Applicant Profile</h2>
      <button (click)="closeDetail()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
    </div>

    <!-- Loading -->
    <div *ngIf="detailLoading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>

    <div *ngIf="!detailLoading" class="flex-1 px-6 py-5 space-y-5">

      <!-- Avatar + Basic Info -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
          {{ selectedApplicant.userEmail?.charAt(0)?.toUpperCase() }}
        </div>
        <div>
          <p class="font-bold text-gray-900 text-lg">{{ applicantProfile?.name || selectedApplicant.userEmail }}</p>
          <p class="text-sm text-gray-400">{{ selectedApplicant.userEmail }}</p>
          <span [class]="getStatusClass(selectedApplicant.status) + ' text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block'">
            {{ getStatusLabel(selectedApplicant.status) }}
          </span>
        </div>
      </div>

      <!-- Application Info -->
      <div class="bg-gray-50 rounded-xl p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Applied</span>
          <span class="font-medium text-gray-800">{{ selectedApplicant.appliedAt | date:'MMM dd, yyyy' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Job</span>
          <span class="font-medium text-gray-800">{{ selectedApplicant.jobTitle || 'Job #' + selectedApplicant.jobId }}</span>
        </div>
        <div *ngIf="applicantProfile?.mobile" class="flex justify-between text-sm">
          <span class="text-gray-500">Mobile</span>
          <span class="font-medium text-gray-800">{{ applicantProfile.mobile }}</span>
        </div> 
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Application ID</span>
          <span class="font-medium text-gray-800 text-xs">#{{ selectedApplicant.applicationId?.substring(0,8) }}</span>
        </div>
      </div>
 
      <!-- Skills -->
      <div *ngIf="applicantProfile?.skills">
        <h3 class="font-semibold text-gray-900 mb-2">Skills</h3>
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let s of applicantProfile.skills.split(',')" class="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full">{{ s.trim() }}</span>
        </div>
      </div>

      <!-- About Me -->
      <div *ngIf="applicantProfile?.headline">
        <h3 class="font-semibold text-gray-900 mb-2">About Me</h3>
        <p class="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{{ applicantProfile.headline }}</p>
      </div>

      <!-- Resumes -->
      <div> 
        <h3 class="font-semibold text-gray-900 mb-3">Resumes</h3>
        <div *ngIf="applicantResumes.length === 0" class="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
          No resumes uploaded 
        </div>
        <div *ngFor="let r of applicantResumes" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
          <div class="flex items-center gap-3"> 
            <span class="text-red-500 text-xl">&#128196;</span> 
            <div> 
              <p class="text-sm font-medium text-gray-800">{{ r.fileUrl?.split('/')?.pop() || 'Resume' }}</p>
              <p class="text-xs text-gray-400">{{ r.uploadedAt | date:'MMM dd, yyyy' }}</p>
            </div> 
          </div> 
          <a [href]="getDownloadUrl(r.fileUrl)" target="_blank"
            class="text-blue-600 text-sm font-medium hover:underline">View</a>
        </div> 
      </div>

      <!-- Update Status --> 
      <div>
        <h3 class="font-semibold text-gray-900 mb-3">Update Status</h3>
        <select (change)="updateStatus(selectedApplicant.applicationId, $event)"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="APPLIED" [selected]="selectedApplicant.status === 'APPLIED'">Applied</option>
          <option value="SHORTLISTED" [selected]="selectedApplicant.status === 'SHORTLISTED'">Shortlisted</option>
          <option value="INTERVIEW_SCHEDULED" [selected]="selectedApplicant.status === 'INTERVIEW_SCHEDULED'">Interview Scheduled</option>
          <option value="REJECTED" [selected]="selectedApplicant.status === 'REJECTED'">Rejected</option>
        </select> 
      </div>

    </div>
  </div>
</div>
  `
})
export class ApplicantsComponent implements OnInit { 

  applications: any[] = [];
  loading = true;
  jobId = 0;
  searchTerm = '';
  statusFilter = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  selectedApplicant: any = null;
  applicantResumes: any[] = [];
  applicantProfile: any = null;
  detailLoading = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private applicantService: ApplicantService,
    private recruiterJobService: RecruiterJobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jobId = Number(params['jobId']);
      if (this.jobId) {
        this.loadApplicants();
      } else {
        this.loadAllApplicants();
      }
    });
  }

  loadAllApplicants() {
    this.loading = true;
    this.recruiterJobService.getMyJobs(0, 500).subscribe({
      next: (res) => {
        const jobs = res.content || res;
        if (jobs.length === 0) { this.loading = false; this.cdr.detectChanges(); return; }
        const allApps: any[] = [];
        let pending = jobs.length;
        jobs.forEach((job: any) => {
          this.applicantService.getApplicants(job.jobId, 0, 500).subscribe({
            next: (r) => {
              const apps = r.content || r;
              apps.forEach((a: any) => { a.jobTitle = job.title; a.jobCompany = job.company; });
              allApps.push(...apps);
            },
            error: () => {},
          }).add(() => {
            pending--;
            if (pending === 0) {
              this.applications = allApps.sort((a, b) =>
                new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
              );
              this.totalElements = this.applications.length;
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadApplicants() {
    this.loading = true;
    this.applicantService.getApplicants(this.jobId, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.applications = res.content || res;
        this.totalElements = res.totalElements || this.applications.length;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredApplications() {
    return this.applications.filter(a => {
      const matchSearch = !this.searchTerm || a.userEmail?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || a.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  get shortlistedCount() {
    return this.applications.filter(a => a.status === 'SHORTLISTED').length;
  }

  updateStatus(applicationId: string, event: any) {
    const status = event.target.value;
    this.applicantService.updateStatus(applicationId, status).subscribe({
      next: (res) => {
        this.applications = this.applications.map(a =>
          a.applicationId === applicationId ? { ...a, status: res.status || status } : a
        );
        if (this.selectedApplicant?.applicationId === applicationId) {
          this.selectedApplicant = { ...this.selectedApplicant, status: res.status || status };
        }
        this.totalElements = this.applications.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Status update failed', err);
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'APPLIED': 'bg-blue-100 text-blue-700',
      'SHORTLISTED': 'bg-yellow-100 text-yellow-700',
      'INTERVIEW_SCHEDULED': 'bg-purple-100 text-purple-700',
      'REJECTED': 'bg-red-100 text-red-600'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'APPLIED': 'Applied',
      'SHORTLISTED': 'Shortlisted',
      'INTERVIEW_SCHEDULED': 'Interview Scheduled',
      'REJECTED': 'Rejected'
    };
    return map[status] || status;
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadApplicants();
  }

  openDetail(app: any) {
    this.selectedApplicant = app;
    this.applicantResumes = [];
    this.applicantProfile = null;
    this.detailLoading = true;
    this.cdr.detectChanges();
    let pending = 2;
    const done = () => { if (--pending === 0) { this.detailLoading = false; this.cdr.detectChanges(); } };
    this.applicantService.getResumesByEmail(app.userEmail).subscribe({
      next: (res) => { this.applicantResumes = res; done(); },
      error: () => done()
    });
    this.applicantService.getUserByEmail(app.userEmail).subscribe({
      next: (res) => { this.applicantProfile = res; done(); },
      error: () => done()
    });
  }

  closeDetail() { this.selectedApplicant = null; this.applicantResumes = []; this.applicantProfile = null; }

  getDownloadUrl(fileUrl: string): string {
    const filename = fileUrl?.split('/').pop();
    return `${this.applicantService['base']}/api/resumes/download/${filename}`;
  }

  getPages(): number[] {
    return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i);
  }

}

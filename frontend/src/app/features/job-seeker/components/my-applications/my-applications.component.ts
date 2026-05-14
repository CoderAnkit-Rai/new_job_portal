import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ApplicationService } from '../../services/application.service';
import { JobService } from '../../services/job.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50">
  <app-navbar /> 
  <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Applications</h1>
        <p class="text-sm text-gray-500 mt-1">Track and manage your job applications.</p>
      </div>
      <div class="flex gap-3"> 
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center">
          <p class="text-2xl font-bold text-blue-700">{{ totalElements }}</p>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Total Applied</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ totalInterviews }}</p>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Interviews</p>
        </div>
      </div> 
    </div>

    <div class="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex gap-3">
      <div class="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2">
        <span class="text-gray-400">🔍</span>
        <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" type="text"
          placeholder="Search by job title..." class="text-sm outline-none w-full" />
      </div>
      <select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilter()"
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
        <option *ngFor="let s of statuses">{{ s }}</option>
      </select>
    </div>
 
    <div *ngIf="loading" class="bg-white rounded-xl p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
    </div>
    <div *ngIf="error" class="text-center text-red-500 py-10">{{ error }}</div>

    <div *ngIf="!loading && !error" class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Job</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Company</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date Applied</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr *ngFor="let app of displayedApplications" class="hover:bg-gray-50 transition">
            <td class="px-5 py-4">
              <button (click)="viewJob(app.jobId)" class="text-sm font-medium text-blue-600 hover:underline">
                {{ jobMap[app.jobId]?.title || 'Job #' + app.jobId }}
              </button>
            </td>
            <td class="px-5 py-4 text-sm text-gray-600">
              {{ jobMap[app.jobId]?.company || '—' }}
            </td>
            <td class="px-5 py-4 text-sm text-gray-500">{{ app.appliedAt | date:'MMM dd, yyyy' }}</td>
            <td class="px-5 py-4">
              <span [class]="getStatusClass(app.status) + ' text-xs font-semibold px-3 py-1 rounded-full'">
                {{ getStatusLabel(app.status) }}
              </span>
            </td>
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <button (click)="viewJob(app.jobId)" class="text-sm text-blue-600 hover:underline font-medium">View Job</button>
                <button *ngIf="app.status === 'APPLIED'" (click)="withdraw(app.applicationId)"
                  class="text-sm text-red-500 hover:underline font-medium">Withdraw</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="displayedApplications.length === 0" class="text-center py-12 text-gray-400">
        <div class="text-4xl mb-3">📋</div>
        <p class="font-medium">No applications found</p> 
        <p class="text-sm mt-1">Start applying to jobs!</p>
      </div>

      <div *ngIf="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p class="text-sm text-gray-500">
          Showing <span class="font-medium">{{ displayedApplications.length }}</span> of
          <span class="font-medium">{{ totalElements }}</span> results
        </p>
        <div class="flex gap-1">
          <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
            class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">‹</button>
          <button *ngFor="let p of getPages()" (click)="goToPage(p)"
            [class]="currentPage === p ? 'px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm' : 'px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50'">
            {{ p + 1 }}
          </button>
          <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
            class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">›</button>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</div>
  `
})
export class MyApplicationsComponent implements OnInit {

  allApplications: any[] = [];
  applications: any[] = [];
  displayedApplications: any[] = [];
  jobMap: { [jobId: number]: any } = {};
  base = environment.apiUrl;
  loading = true;
  error = '';
  searchTerm = '';
  selectedStatus = 'All Statuses';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  statuses = ['All Statuses', 'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED'];

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentPage = +(this.route.snapshot.queryParamMap.get('page') || 0);
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    // Fetch all applications for client-side sort + pagination
    this.applicationService.getMyApplications(0, 500).subscribe({
      next: (res) => {
        const raw = res.content || res;
        this.allApplications = raw.sort((a: any, b: any) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
        this.applications = this.allApplications;
        this.totalElements = res.totalElements || this.allApplications.length;
        this.totalPages = Math.ceil(this.allApplications.length / this.pageSize);
        this.fetchJobDetails();
      },
      error: () => {
        this.error = 'Failed to load applications';
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  fetchJobDetails() {
    const uniqueJobIds = [...new Set(this.applications.map(a => a.jobId))];
    if (uniqueJobIds.length === 0) {
      this.loading = false;
      this.applyFilter();
      return;
    }

    const requests = uniqueJobIds.map(id =>
      this.jobService.getJobById(id).pipe(
        catchError(() =>
          // fallback to job-service if search-service doesn't have it
          this.http.get(`${this.base}/api/jobs/${id}`).pipe(
            catchError(() => of({ jobId: id, title: 'Job #' + id, company: '—' }))
          )
        )
      )
    );

    forkJoin(requests).subscribe({
      next: (jobs) => {
        jobs.forEach((job: any) => {
          if (job) this.jobMap[job.jobId] = job;
        });
        this.loading = false;
        this.applyFilter();
      },
      error: () => {
        this.loading = false;
        this.applyFilter();
      }
    });
  }

  applyFilter() {
    const filtered = this.allApplications.filter(app => {
      const jobTitle = this.jobMap[app.jobId]?.title?.toLowerCase() || '';
      const matchSearch = !this.searchTerm ||
        jobTitle.includes(this.searchTerm.toLowerCase()) ||
        app.jobId?.toString().includes(this.searchTerm);
      const matchStatus = this.selectedStatus === 'All Statuses' || app.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
    this.totalElements = filtered.length;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = this.currentPage * this.pageSize;
    this.displayedApplications = filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  get totalInterviews() {
    return this.allApplications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
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

  viewJob(jobId: number) { this.router.navigate(['/jobs', jobId], { queryParams: { from: 'applications', page: this.currentPage } }); }

  withdraw(applicationId: string) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    this.applicationService.withdrawApplication(applicationId).subscribe({
      next: () => {
        this.allApplications = this.allApplications.filter(a => a.applicationId !== applicationId);
        this.applyFilter();
      },
      error: (err) => alert(err?.error?.message || 'Could not withdraw application')
    });
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.applyFilter();
  }

  getPages(): number[] {
    return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-search-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50">
  <app-navbar />
  <main class="flex-1 flex">
    <!-- Sidebar -->
    <aside class="w-72 bg-white border-r border-gray-200 px-6 py-8 shrink-0 self-start sticky top-0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-800">Filters</h2>
        <button (click)="clearFilters()" class="text-blue-600 text-sm hover:underline">Clear All</button>
      </div>
      <div class="mb-7">
        <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input [(ngModel)]="location" type="text" placeholder="City, state, or zip"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none mb-2" />
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" [(ngModel)]="remoteOnly" (ngModelChange)="search()" /> Remote Only
        </label>
      </div>
      <div class="mb-7">
        <label class="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
        <div *ngFor="let level of experienceLevels" class="flex items-center gap-2 mb-1.5">
          <input type="checkbox" [checked]="selectedExperience.includes(level)" (change)="toggleExperience(level)" />
          <span class="text-sm text-gray-600">{{ level }}</span>
        </div>
      </div>
      <div class="mb-7">
        <label class="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
        <div *ngFor="let type of jobTypes" class="flex items-center gap-2 mb-1.5">
          <input type="checkbox" [checked]="selectedJobTypes.includes(type)" (change)="toggleJobType(type)" />
          <span class="text-sm text-gray-600">{{ type }}</span>
        </div>
      </div>
      <div class="mb-7">
        <label class="block text-sm font-medium text-gray-700 mb-2">Date Posted</label>
        <select [(ngModel)]="datePosted" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option *ngFor="let d of dateOptions">{{ d }}</option>
        </select>
      </div>
      <button (click)="search()" class="w-full bg-blue-700 text-white py-2 rounded-full text-sm font-medium hover:bg-blue-800 transition">
        Apply Filters
      </button>
    </aside>

    <!-- Main -->
    <div class="flex-1 p-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div class="flex gap-2 mb-4">
          <button (click)="searchMode = 'keyword'"
            [class]="searchMode === 'keyword' ? 'bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium' : 'text-gray-500 px-4 py-1.5 rounded-full text-sm hover:bg-gray-50'">
            Keyword Search
          </button>
          <button (click)="searchMode = 'skills'"
            [class]="searchMode === 'skills' ? 'bg-gray-100 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium' : 'text-gray-500 px-4 py-1.5 rounded-full text-sm hover:bg-gray-50'">
            Skills Search
          </button>
        </div>
        <div class="flex gap-3">
          <div class="flex-1 flex items-center border border-gray-200 rounded-lg px-4 py-2.5 gap-2">
            <span class="text-gray-400">🔍</span>
            <input [(ngModel)]="keyword" type="text"
              [placeholder]="searchMode === 'keyword' ? 'Job title, keywords...' : 'Skills e.g. React, Java...'"
              class="text-sm outline-none w-full" (keyup.enter)="search()" />
          </div>
          <button (click)="search()" class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition">
            Search Jobs
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4" *ngIf="!loading">
        <p class="text-sm text-gray-600">
          <span class="text-blue-600 font-semibold">{{ totalElements }}</span>
          jobs{{ keyword ? ' for "' + keyword + '"' : ' found' }}
        </p>
        <select [(ngModel)]="sortBy" (ngModelChange)="onSortChange($event)"
          class="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none">
          <option>Relevance</option>
          <option>Newest</option>
          <option>Salary</option>
        </select>
      </div>

      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="bg-white rounded-xl p-5 animate-pulse h-32"></div>
      </div>
      <div *ngIf="error" class="text-center text-red-500 py-10">{{ error }}</div>

      <div *ngIf="!loading && !error" class="space-y-3">
        <div *ngFor="let job of displayedJobs"
          class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
          (click)="viewJob(job.jobId)">
          <div class="flex items-start justify-between">
            <div class="flex gap-4 flex-1">
              <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                {{ job.company?.charAt(0) || 'C' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900">{{ job.title }}</h3>
                  <span [ngClass]="{'bg-green-100 text-green-700': job.status === 'OPEN','bg-red-100 text-red-600': job.status === 'CLOSED'}"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full">{{ job.status }}</span>
                </div>
                <p class="text-blue-600 text-sm font-medium mb-1">{{ job.company }}</p>
                <div class="flex gap-4 text-xs text-gray-500 mb-2">
                  <span>📍 {{ job.location }}</span>
                  <span *ngIf="job.salary">💰 \${{ job.salary | number }}/yr</span>
                </div>
                <p class="text-xs text-gray-500">{{ job.description }}</p>
                <div *ngIf="job.skills" class="flex flex-wrap gap-1 mt-2">
                  <span *ngFor="let skill of job.skills?.split(',')?.slice(0,4)"
                    class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{{ skill.trim() }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 ml-4 shrink-0" (click)="$event.stopPropagation()">
              <button *ngIf="job.status === 'OPEN' && !appliedJobIds.has(job.jobId)"
                (click)="applyNow(job.jobId, $event)" [disabled]="applyingJobId === job.jobId"
                class="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition disabled:opacity-50">
                {{ applyingJobId === job.jobId ? 'Applying...' : 'Apply Now' }}
              </button>
              <button *ngIf="appliedJobIds.has(job.jobId)"
                class="bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full cursor-default">Applied ✓</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && displayedJobs.length === 0" class="text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">🔍</div>
        <p class="text-lg font-medium">No jobs found</p>
        <p class="text-sm mt-1">Try different keywords or filters</p>
      </div>

      <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
          class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">‹</button>
        <button *ngFor="let p of getPages()" (click)="goToPage(p)"
          [class]="currentPage === p ? 'px-3 py-1.5 bg-blue-700 text-white rounded-lg text-sm' : 'px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50'">
          {{ p + 1 }}
        </button>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
          class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">›</button>
      </div>
    </div>
  </main>
  <app-footer />
</div>
  `
})
export class SearchJobsComponent implements OnInit {

  keyword = '';
  location = '';
  remoteOnly = false;
  selectedJobTypes: string[] = [];
  selectedExperience: string[] = [];
  datePosted = 'Past Week';
  searchMode = 'keyword';
  sortBy = 'Relevance';

  allJobs: any[] = [];
  displayedJobs: any[] = [];
  loading = false;
  error = '';
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  experienceLevels = ['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director'];
  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  dateOptions = ['Any Time', 'Past 24 hours', 'Past Week', 'Past Month'];

  appliedJobIds = new Set<number>();
  applyingJobId: number | null = null;

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAppliedJobs();
    const page = +(this.route.snapshot.queryParamMap.get('page') || 0);
    const q = this.route.snapshot.queryParamMap.get('q') || '';
    this.currentPage = page;
    if (q) this.keyword = q;
    this.search(false);
  }

  loadAppliedJobs() {
    this.applicationService.getMyApplications(0, 100).subscribe({
      next: (res) => {
        const apps = res.content || res;
        this.appliedJobIds = new Set(apps.map((a: any) => a.jobId));
        this.cdr.detectChanges();
      }
    });
  }

  search(resetPage = true) {
    this.loading = true;
    this.error = '';
    if (resetPage) this.currentPage = 0;
    const filters = { keyword: this.keyword, location: this.remoteOnly ? '' : this.location };
    this.jobService.searchJobs(filters, 0, 500).subscribe({
      next: (res) => {
        let jobs = res.content || res;
        // Remote Only filter
        if (this.remoteOnly) {
          jobs = jobs.filter((j: any) => j.jobType?.toLowerCase() === 'remote');
        }
        // Job type filter
        if (this.selectedJobTypes.length > 0) {
          jobs = jobs.filter((j: any) => {
            if (this.selectedJobTypes.includes('Full-time') && (!j.jobType || j.jobType.toLowerCase() === 'full-time')) return true;
            return this.selectedJobTypes.some(t => j.jobType?.toLowerCase() === t.toLowerCase());
          });
        }
        // Experience level filter
        if (this.selectedExperience.length > 0) {
          jobs = jobs.filter((j: any) =>
            this.selectedExperience.some(e => j.experienceLevel?.toLowerCase() === e.toLowerCase())
          );
        }
        this.allJobs = jobs;
        this.totalElements = jobs.length;
        this.loading = false;
        this.applySortAndPaginate();
      },
      error: () => { this.error = 'Failed to search jobs'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSortChange(sort: string) {
    this.sortBy = sort;
    this.currentPage = 0;
    this.applySortAndPaginate();
  }

  applySortAndPaginate() {
    let sorted = [...this.allJobs];
    if (this.sortBy === 'Newest') {
      sorted = sorted.sort((a: any, b: any) => (b.jobId || 0) - (a.jobId || 0));
    } else if (this.sortBy === 'Salary') {
      sorted = sorted.sort((a: any, b: any) => (b.salary || 0) - (a.salary || 0));
    }
    this.totalPages = Math.ceil(sorted.length / this.pageSize);
    const start = this.currentPage * this.pageSize;
    this.displayedJobs = sorted.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  toggleJobType(type: string) {
    const idx = this.selectedJobTypes.indexOf(type);
    if (idx > -1) this.selectedJobTypes.splice(idx, 1); else this.selectedJobTypes.push(type);
    this.search();
  }

  toggleExperience(level: string) {
    const idx = this.selectedExperience.indexOf(level);
    if (idx > -1) this.selectedExperience.splice(idx, 1); else this.selectedExperience.push(level);
    this.search();
  }

  clearFilters() {
    this.keyword = ''; this.location = ''; this.remoteOnly = false;
    this.selectedJobTypes = []; this.selectedExperience = [];
    this.sortBy = 'Relevance';
    this.search();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.applySortAndPaginate();
    window.scrollTo(0, 0);
  }

  viewJob(jobId: number) { this.router.navigate(['/jobs', jobId], { queryParams: { from: 'search', page: this.currentPage } }); }

  applyNow(jobId: number, event: Event) {
    event.stopPropagation();
    this.applyingJobId = jobId;
    this.applicationService.applyForJob(jobId).subscribe({
      next: () => { this.appliedJobIds.add(jobId); this.applyingJobId = null; this.cdr.detectChanges(); },
      error: () => { this.applyingJobId = null; this.cdr.detectChanges(); }
    });
  }

  getPages(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }
}

import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-recommended-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './recommended-jobs.component.html'
})
export class RecommendedJobsComponent implements OnInit {

  Math = Math;
  jobs: any[] = [];
  allJobs: any[] = [];
  loading = true;
  error = '';
  activeFilter = 'All Jobs';
  filters = ['All Jobs', 'Remote', 'Full-time'];
  appliedJobIds = new Set<number>();
  applyingJobId: number | null = null;
  sortBy = 'Newest';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 9;

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadAppliedJobs();
    const filter = this.route.snapshot.queryParamMap.get('filter') || 'All Jobs';
    const page = +(this.route.snapshot.queryParamMap.get('page') || 0);
    this.currentPage = page;
    if (filter !== 'All Jobs') {
      this.setFilter(filter);
    } else {
      this.loadJobs();
    }
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

  loadJobs() {
    this.loading = true;
    this.error = '';
    this.jobService.getAllOpenJobs(0, 500).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.allJobs = res.content || res;
          this.totalElements = res.totalElements || this.allJobs.length;
          this.applySortAndPaginate();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'Failed to load jobs';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  applySortAndPaginate() {
    let sorted = [...this.allJobs];
    if (this.sortBy === 'Newest') {
      sorted.sort((a: any, b: any) => (b.jobId || 0) - (a.jobId || 0));
    } else if (this.sortBy === 'Salary') {
      sorted.sort((a: any, b: any) => (b.salary || 0) - (a.salary || 0));
    }
    this.totalPages = Math.ceil(sorted.length / this.pageSize);
    const start = this.currentPage * this.pageSize;
    this.jobs = sorted.slice(start, start + this.pageSize);
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.currentPage = 0;
    this.jobService.getAllOpenJobs(0, 500).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          let jobs = res.content || res;
          if (filter === 'Remote') {
            jobs = jobs.filter((j: any) => j.jobType?.toLowerCase() === 'remote');
          } else if (filter === 'Full-time') {
            jobs = jobs.filter((j: any) => !j.jobType || j.jobType.toLowerCase() === 'full-time');
          }

          this.allJobs = jobs;
          this.totalElements = jobs.length;
          this.applySortAndPaginate();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.loading = false; }
    });
  }

  onSortChange(sort: string) {
    this.sortBy = sort;
    this.currentPage = 0;
    this.applySortAndPaginate();
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.applySortAndPaginate();
    this.cdr.detectChanges();
    window.scrollTo(0, 0);
  }

  getPages(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  applyNow(jobId: number) {
    this.applyingJobId = jobId;
    this.applicationService.applyForJob(jobId).subscribe({
      next: () => {
        this.appliedJobIds = new Set([...this.appliedJobIds, jobId]);
        this.applyingJobId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.applyingJobId = null;
        this.cdr.detectChanges();
      }
    });
  }

  viewJob(jobId: number) {
    this.router.navigate(['/jobs', jobId], { queryParams: { filter: this.activeFilter, page: this.currentPage } });
  }

  getStatusBadge(job: any): string {
    if (this.appliedJobIds.has(job.jobId)) return 'APPLIED';
    return job.status || 'OPEN';
  }
}

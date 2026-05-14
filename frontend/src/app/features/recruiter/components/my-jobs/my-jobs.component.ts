import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RecruiterJobService } from '../../services/recruiter-job.service';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './my-jobs.component.html'
})
export class MyJobsComponent implements OnInit {

  jobs: any[] = [];
  displayedJobs: any[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  constructor(
    public router: Router,
    private recruiterJobService: RecruiterJobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadJobs(); }

  loadJobs() {
    this.loading = true;
    this.recruiterJobService.getMyJobs(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.jobs = res.content || res;
        this.totalElements = res.totalElements || this.jobs.length;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    this.displayedJobs = this.jobs.filter((j: any) => {
      const matchSearch = !this.searchTerm || j.title?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || j.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.cdr.detectChanges();
  }

  
  closeJob(jobId: number) {
    this.recruiterJobService.closeJob(jobId).subscribe({
      next: () => {
        const job = this.jobs.find((j: any) => j.jobId === jobId);
        if (job) job.status = 'CLOSED';
        this.applyFilter();
      }
    });
  }

  viewApplicants(jobId: number) { this.router.navigate(['/recruiter/applicants', jobId]); }

  editJob(jobId: number) { this.router.navigate(['/recruiter/post-job'], { queryParams: { edit: jobId } }); }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadJobs();
  }

  getPages(): number[] {
    return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i);
  }
}

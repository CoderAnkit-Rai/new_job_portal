import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { RecruiterJobService } from '../../services/recruiter-job.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, ConfirmModalComponent],
  templateUrl: './post-job.component.html'
})
export class PostJobComponent implements OnInit {

  form: any = {
    title: '',
    company: '',
    location: '',
    salary: null,
    description: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-Senior level'
  };

  loading = false;
  success = false;
  showSuccessModal = false;
  error = '';
  editJobId: number | null = null;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private recruiterJobService: RecruiterJobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (editId) {
      this.editJobId = Number(editId);
      this.recruiterJobService.getJobById(this.editJobId).subscribe({
        next: (job) => {
          this.form.title = job.title;
          this.form.company = job.company;
          this.form.location = job.location;
          this.form.salary = job.salary;
          this.form.description = job.description;
          this.form.employmentType = job.jobType || 'Full-time';
          this.form.experienceLevel = job.experienceLevel || 'Mid-Senior level';
          this.cdr.detectChanges();
        }
      });
    }
  }

  submitJob() {
    if (this.loading) return;
    if (!this.form.title || !this.form.company || !this.form.location || !this.form.description) {
      this.error = 'Please fill in all required fields';
      return;
    }
    if (this.form.salary !== null && this.form.salary < 0) {
      this.error = 'Salary cannot be negative';
      return;
    }
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    const payload = {
      title: this.form.title,
      company: this.form.company,
      location: this.form.location,
      salary: this.form.salary,
      description: this.form.description,
      jobType: this.form.employmentType,
      experienceLevel: this.form.experienceLevel
    };
    const request$ = this.editJobId
      ? this.recruiterJobService.updateJob(this.editJobId, payload)
      : this.recruiterJobService.createJob(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save job';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

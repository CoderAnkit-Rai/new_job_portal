import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
  },

  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/components/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },

  // Job Seeker routes
  {
    path: 'jobs',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/recommended-jobs/recommended-jobs.component').then(m => m.RecommendedJobsComponent)
  },
  {
    path: 'jobs/search',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/search-jobs/search-jobs.component').then(m => m.SearchJobsComponent)
  },
  {
    path: 'jobs/:id',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },
  {
    path: 'applications',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/my-profile/my-profile.component').then(m => m.MyProfileComponent)
  },
  {
    path: 'resume',
    canActivate: [authGuard, roleGuard(['JOB_SEEKER'])],
    loadComponent: () => import('./features/job-seeker/components/resume-profile/resume-profile.component').then(m => m.ResumeProfileComponent)
  },

  // Recruiter routes
  {
    path: 'recruiter/dashboard',
    canActivate: [authGuard, roleGuard(['RECRUITER'])],
    loadComponent: () => import('./features/recruiter/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'recruiter/post-job',
    canActivate: [authGuard, roleGuard(['RECRUITER'])],
    loadComponent: () => import('./features/recruiter/components/post-job/post-job.component').then(m => m.PostJobComponent)
  },
  {
    path: 'recruiter/my-jobs',
    canActivate: [authGuard, roleGuard(['RECRUITER'])],
    loadComponent: () => import('./features/recruiter/components/my-jobs/my-jobs.component').then(m => m.MyJobsComponent)
  },
  {
    path: 'recruiter/applicants/:jobId',
    canActivate: [authGuard, roleGuard(['RECRUITER'])],
    loadComponent: () => import('./features/recruiter/components/applicants/applicants.component').then(m => m.ApplicantsComponent)
  },
  {
    path: 'recruiter/profile',
    canActivate: [authGuard, roleGuard(['RECRUITER'])],
    loadComponent: () => import('./features/recruiter/components/profile/recruiter-profile.component').then(m => m.RecruiterProfileComponent)
  },

  // Legal routes
  { path: 'about', loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent), data: { page: 'about' } },
  { path: 'careers', loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent), data: { page: 'careers' } },
  { path: 'privacy', loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent), data: { page: 'privacy' } },
  { path: 'terms', loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent), data: { page: 'terms' } },
  { path: 'help', loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent), data: { page: 'help' } },

  { path: '**', redirectTo: 'login' }
];

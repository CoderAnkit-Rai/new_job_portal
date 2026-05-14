import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const PAGES: Record<string, { title: string; icon: string; content: Section[] }> = {
  about: {
    title: 'About JobCompass',
    icon: '🧭',
    content: [
      {
        heading: 'Our Mission',
        body: 'JobCompass is built to bridge the gap between talented job seekers and great companies. We believe finding the right job — or the right candidate — should be simple, transparent, and fast.'
      },
      {
        heading: 'What We Do',
        body: 'We provide a modern job portal where job seekers can discover opportunities, track applications, and get AI-powered career guidance. Recruiters can post jobs, manage applicants, and build their hiring pipeline — all in one place.'
      },
      {
        heading: 'Why JobCompass',
        body: 'Unlike traditional job boards, JobCompass is designed with the user experience first. Clean interfaces, real-time status updates, AI assistance, and smart filtering make the hiring process smoother for everyone involved.'
      },
      {
        heading: 'Our Values',
        body: 'Transparency, simplicity, and fairness. We believe every candidate deserves to know where they stand, and every recruiter deserves tools that save time without sacrificing quality.'
      }
    ]
  },
  careers: {
    title: 'Careers at JobCompass',
    icon: '💼',
    content: [
      {
        heading: "We're Hiring!",
        body: "JobCompass is growing and we're always looking for passionate people to join our team. We're a remote-first company that values autonomy, creativity, and impact."
      },
      {
        heading: 'Open Roles',
        body: 'Frontend Engineer (Angular/React), Backend Engineer (Spring Boot), Product Designer (UI/UX), AI/ML Engineer, DevOps Engineer. All roles are remote-friendly.'
      },
      {
        heading: 'Our Culture',
        body: 'We move fast, ship often, and care deeply about the people who use our product. You\'ll work with a small, focused team where your contributions have real impact from day one.'
      },
      {
        heading: 'How to Apply',
        body: 'Send your resume and a short note about why you want to join JobCompass to careers@jobcompass.io. We review every application personally.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: '🔒',
    content: [
      {
        heading: 'Information We Collect',
        body: 'We collect information you provide directly — such as your name, email address, resume, and profile details. We also collect usage data to improve our services.'
      },
      {
        heading: 'How We Use Your Information',
        body: 'Your information is used to provide and improve our services, match you with relevant jobs, and communicate important updates. We never sell your personal data to third parties.'
      },
      {
        heading: 'Data Security',
        body: 'We use industry-standard encryption and security practices to protect your data. All passwords are hashed and sensitive data is encrypted at rest and in transit.'
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to access, update, or delete your personal data at any time. Contact us at privacy@jobcompass.io to exercise your rights.'
      },
      {
        heading: 'Cookies',
        body: 'We use cookies to maintain your session and improve your experience. You can disable cookies in your browser settings, though some features may not work as expected.'
      },
      {
        heading: 'Contact',
        body: 'For privacy-related questions, contact us at privacy@jobcompass.io. Last updated: January 2026.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service',
    icon: '📄',
    content: [
      {
        heading: 'Acceptance of Terms',
        body: 'By using JobCompass, you agree to these Terms of Service. If you do not agree, please do not use our platform.'
      },
      {
        heading: 'Use of the Platform',
        body: 'JobCompass is intended for legitimate job seeking and recruiting purposes. You agree not to misuse the platform, post false information, or engage in any fraudulent activity.'
      },
      {
        heading: 'User Accounts',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.'
      },
      {
        heading: 'Content',
        body: 'You retain ownership of content you post. By posting, you grant JobCompass a license to display and distribute that content on our platform. You are responsible for ensuring your content is accurate and lawful.'
      },
      {
        heading: 'Limitation of Liability',
        body: 'JobCompass is not responsible for the accuracy of job listings or the outcome of any hiring process. We provide the platform as-is without guarantees of employment.'
      },
      {
        heading: 'Changes to Terms',
        body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. Last updated: January 2026.'
      }
    ]
  },
  help: {
    title: 'Help & FAQ',
    icon: '❓',
    content: [
      {
        heading: 'How do I create an account?',
        body: 'Click "Get Started" on the homepage and choose your role — Job Seeker or Recruiter. Fill in your details and click "Agree & Join" to create your account.'
      },
      {
        heading: 'How do I apply for a job?',
        body: 'Browse jobs on the Jobs page, click on a job to view details, then click "Apply Now". Your profile and resume will be sent to the recruiter automatically.'
      },
      {
        heading: 'How do I track my applications?',
        body: 'Go to the Applications page to see all your applications and their current status — Applied, Shortlisted, Interview Scheduled, or Rejected.'
      },
      {
        heading: 'How do I post a job as a recruiter?',
        body: 'Log in as a Recruiter, go to "Post Job" in the navbar, fill in the job details, and click "Post Job". Your listing will be live immediately.'
      },
      {
        heading: 'How do I reset my password?',
        body: 'Go to your profile and click "Change Password". Enter your current password and your new password to update it.'
      },
      {
        heading: 'Still need help?',
        body: 'Contact our support team at support@jobcompass.io and we\'ll get back to you within 24 hours.'
      }
    ]
  }
};

interface Section { heading: string; body: string; }

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="min-h-screen bg-gray-50 flex flex-col">

  <!-- Minimal Navbar -->
  <nav class="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
    <a routerLink="/" class="flex items-center gap-2 cursor-pointer">
      <span class="text-xl">🧭</span>
      <span class="font-black tracking-widest uppercase text-sm">
        <span class="text-gray-900">JOB</span><span class="text-red-600">COMPASS</span><span class="text-red-400 text-xs align-super">▲</span>
      </span>
    </a>
    <button (click)="goBack()" class="text-sm text-blue-600 hover:underline font-medium">← Back</button>
  </nav>

  <main class="flex-1 max-w-3xl mx-auto w-full px-6 py-12">

    <!-- Header -->
    <div class="mb-10 text-center">
      <div class="text-5xl mb-4">{{ page?.icon }}</div>
      <h1 class="text-3xl font-bold text-gray-900">{{ page?.title }}</h1>
    </div>

    <!-- Content Sections -->
    <div class="space-y-8">
      <div *ngFor="let section of page?.content" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-bold text-gray-900 text-lg mb-3">{{ section.heading }}</h2>
        <p class="text-gray-600 leading-relaxed">{{ section.body }}</p>
      </div>
    </div>

  </main>

  <!-- Footer -->
  <footer class="py-8 text-center text-xs text-gray-400 border-t border-gray-100">
    <div class="flex justify-center gap-6 mb-3">
      <a routerLink="/about" class="hover:text-gray-600">About</a>
      <a routerLink="/careers" class="hover:text-gray-600">Careers</a>
      <a routerLink="/privacy" class="hover:text-gray-600">Privacy</a>
      <a routerLink="/terms" class="hover:text-gray-600">Terms</a>
      <a routerLink="/help" class="hover:text-gray-600">Help</a>
    </div>
    © 2026 <span class="font-black text-gray-600 tracking-widest uppercase" style="text-shadow:1px 1px 0 #cbd5e1">JOB</span><span class="font-black text-red-600 tracking-widest uppercase" style="text-shadow:1px 1px 0 #fecaca">COMPASS</span><span class="text-red-400 text-xs align-super">▲</span>. All rights reserved.
  </footer>

</div>
  `
})
export class LegalComponent implements OnInit {
  page: { title: string; icon: string; content: Section[] } | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.page = PAGES[data['page']] || null;
    });
  }

  goBack() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
      else if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
      else this.router.navigate(['/jobs']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-resume-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  template: `
<div class="min-h-screen flex flex-col bg-gray-50">
  <app-navbar />

  <!-- Toast Popup -->
  <div *ngIf="toastMessage" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 min-w-80">
    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl shrink-0">✅</div>
    <div> 
      <p class="font-semibold text-gray-900 text-sm">{{ toastMessage }}</p>
      <p class="text-xs text-gray-400 mt-0.5">{{ toastSub }}</p>
    </div> 
    <button (click)="toastMessage = ''" class="ml-auto text-gray-300 hover:text-gray-500 text-xl leading-none">&times;</button>
  </div>

  <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Resume &amp; Profile</h1>
      <p class="text-sm text-gray-500 mt-1">Manage your professional details and application documents.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-5">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-bold text-gray-900 mb-4">Upload New Resume</h2>
          <label class="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition">
            <input type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" class="hidden" />
            <div *ngIf="!uploading">
              <div class="text-3xl mb-2">⬆️</div>
              <p class="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-400 mt-1">PDF or DOCX (Max. 5MB)</p>
            </div>
            <div *ngIf="uploading" class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
              <span class="text-sm text-gray-600">Uploading...</span>
            </div>
          </label>
        </div> 
      </div>

      <div class="space-y-5">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-gray-900">Current Resume</h2>
            <span *ngIf="activeResume" class="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">ACTIVE</span>
          </div>
          <div *ngIf="activeResume" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <div class="flex items-center gap-3 cursor-pointer" (click)="openResume(activeResume.fileUrl)">
              <span class="text-red-500 text-xl">📄</span> 
              <div>
                <p class="text-sm font-medium text-blue-600 hover:underline">{{ getFileName(activeResume.fileUrl) }}</p>
                <p class="text-xs text-gray-400">Uploaded {{ activeResume.uploadedAt | date:'MMM dd, yyyy' }}</p>
              </div>
            </div> 
            <button (click)="deleteResume(activeResume.resumeId)" class="text-gray-400 hover:text-red-500 text-sm">🗑</button>
          </div>
          <div *ngIf="!activeResume" class="text-center py-4 text-gray-400 text-sm">No resume uploaded yet</div>
        </div>

        <div *ngIf="historyResumes.length > 0" class="bg-white rounded-xl border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-gray-900">Version History</h2> 
            <span class="text-xs text-gray-400">Past {{ historyResumes.length }} uploads</span>
          </div>
          <div class="space-y-3">
            <div *ngFor="let r of historyResumes" class="flex items-center justify-between"> 
              <div class="flex items-center gap-3 cursor-pointer" (click)="openResume(r.fileUrl)">
                <span class="text-blue-500">📄</span>
                <div>
                  <p class="text-sm text-blue-600 hover:underline">{{ getFileName(r.fileUrl) }}</p>
                  <p class="text-xs text-gray-400">{{ r.uploadedAt | date:'MMM dd, yyyy' }}</p>
                </div>
              </div>
              <button (click)="deleteResume(r.resumeId)" class="text-gray-400 hover:text-red-500">🗑</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</div>
  `
})
export class ResumeProfileComponent implements OnInit {

  resumes: any[] = [];
  uploading = false;
  toastMessage = '';
  toastSub = '';

  constructor(
    private resumeService: ResumeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadResumes();
  }

  showToast(message: string, sub: string) {
    this.toastMessage = message;
    this.toastSub = sub;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  loadResumes() {
    this.resumeService.getMyResumes().subscribe({
      next: (res) => {
        this.resumes = Array.isArray(res) ? res : (res.content || []);
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.cdr.detectChanges();
    this.resumeService.uploadResumeFile(file).subscribe({
      next: (res) => {
        this.resumes = [res, ...this.resumes];
        this.uploading = false;
        this.showToast('Resume uploaded successfully!', this.getFileName(res.fileUrl) + ' is now active.');
        this.cdr.detectChanges();
      },
      error: () => { this.uploading = false; this.cdr.detectChanges(); }
    });
  }

  deleteResume(id: number) {
    this.resumeService.deleteResume(id).subscribe({
      next: () => {
        this.resumes = this.resumes.filter(r => r.resumeId !== id);
        this.cdr.detectChanges();
      }
    });
  }

  get activeResume() { return this.resumes[0] || null; }
  get historyResumes() { return this.resumes.slice(1); }

  getFileName(fileUrl: string): string {
    if (!fileUrl) return 'Resume';
    const parts = fileUrl.split('/');
    const fullName = parts[parts.length - 1];
    return fullName.replace(/_\d{13}(\.[^.]+)$/, '$1');
  }

  openResume(fileUrl: string) {
    if (!fileUrl) return;
    const filename = fileUrl.split('/').pop();
    const url = `http://localhost:8080/api/resumes/download/${filename}`;
    const token = localStorage.getItem('token');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      })
      .catch(err => console.error('Failed to open resume:', err));
  }
}

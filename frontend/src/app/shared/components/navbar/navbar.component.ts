import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { LucideAngularModule, Briefcase, Search, ClipboardList, FileText, LayoutDashboard, PlusCircle, Users, Moon, Sun, ChevronDown, Menu, X, Lock, LogOut, User } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, ConfirmModalComponent, LucideAngularModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  displayName = '';
  dark = localStorage.getItem('theme') === 'dark';

  constructor(public authService: AuthService, private router: Router, private cdr: ChangeDetectorRef, private elRef: ElementRef) {
    document.documentElement.classList.toggle('dark', this.dark);
  }

  ngOnDestroy() {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit() {
    this.displayName = this.authService.getEmail();
    this.authService.loadDisplayName().then(name => {
      this.displayName = name;
      this.cdr.detectChanges();
    });
  }

  get role() { return this.authService.getRole(); }
  get email() { return this.authService.getEmail(); }
  get initials(): string {
    const e = this.email;
    return e ? e.substring(0, 2).toUpperCase() : 'U';
  }

  goHome() {
    const role = this.role;
    if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
    else if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/jobs']);
  }

  readonly Briefcase = Briefcase;
  readonly Search = Search;
  readonly ClipboardList = ClipboardList;
  readonly FileText = FileText;
  readonly LayoutDashboard = LayoutDashboard;
  readonly PlusCircle = PlusCircle;
  readonly Users = Users;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly X = X;
  readonly Lock = Lock;
  readonly LogOut = LogOut;
  readonly User = User;

  navSearch = '';

  goSearch() {
    if (this.navSearch.trim()) {
      this.router.navigate(['/jobs/search'], { queryParams: { q: this.navSearch.trim() } });
      this.navSearch = '';
    }
  }

  toggleDark() {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', this.dark);
    this.cdr.detectChanges();
  }

  showLogoutModal = false;
  mobileMenuOpen = false;
  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }
  closeDropdown() { this.dropdownOpen = false; }
  confirmLogout() { this.dropdownOpen = false; this.showLogoutModal = true; }
  logout() { this.authService.logout(); }
  navigate(path: string) { this.router.navigate([path]); }
}

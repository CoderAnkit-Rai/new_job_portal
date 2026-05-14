import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
<div *ngIf="visible" class="fixed inset-0 z-[999] flex items-center justify-center"> 
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="onCancel()"></div>
  <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4">
    <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-3xl">🚪</div>
    <div class="text-center"> 
      <h2 class="text-lg font-bold text-gray-900 mb-1">Sign Out</h2>
      <p class="text-sm text-gray-500">Are you sure you want to sign out of your account?</p>
    </div>
    <div class="flex gap-3 w-full mt-1"> 
      <button (click)="onCancel()"
        class="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
        Cancel
      </button>
      <button (click)="onConfirm()"
        class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition">
        Sign Out
      </button>
    </div>
  </div>
</div>
  `
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}

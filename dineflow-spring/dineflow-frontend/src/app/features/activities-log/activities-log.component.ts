import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log.service';
import { LucideAngularModule, Clock, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-activities-log',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-xl w-full bg-canvas">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-md">
          <div class="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <lucide-icon name="clock" class="size-5"></lucide-icon>
          </div>
          <div>
            <h1 class="text-heading-lg font-bold uppercase tracking-tight text-ink m-0">Activity Log</h1>
            <p class="text-body-sm text-mute m-0">A timeline of recent system events and user actions.</p>
          </div>
        </div>
        <!-- Pagination top-right -->
        <div class="flex items-center gap-sm text-body-sm text-mute">
          <button (click)="changePage(-1)" [disabled]="currentPage() === 1 || isLoading()"
            class="p-xs hover:text-ink disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors text-mute">
            <lucide-icon name="chevron-left" class="size-4"></lucide-icon>
          </button>
          <span class="font-bold text-ink">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button (click)="changePage(1)" [disabled]="currentPage() >= totalPages() || isLoading()"
            class="p-xs hover:text-ink disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors text-mute">
            <lucide-icon name="chevron-right" class="size-4"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-xxxl">
        <div class="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading() && logs().length === 0"
        class="text-center text-mute py-xxxl border border-hairline rounded-md bg-surface-bone">
        No activity logs found.
      </div>

      <!-- Timeline Feed -->
      <div *ngIf="!isLoading() && logs().length > 0" class="flex flex-col gap-0 mt-md">
        <div *ngFor="let log of logs(); let last = last" class="flex gap-md pb-xl relative">

          <!-- Timeline dot + vertical line -->
          <div class="flex flex-col items-center shrink-0 pt-1">
            <div class="size-3 rounded-full bg-primary shrink-0 mt-0.5 shadow-sm"></div>
            <div *ngIf="!last" class="w-px flex-1 bg-hairline mt-1.5 min-h-[2rem]"></div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pb-xs">
            <div class="flex items-center justify-between mb-sm gap-sm">
              <span class="font-bold text-body-sm text-ink uppercase tracking-wider">{{ log.action }}</span>
              <div class="flex items-center gap-xs text-caption text-mute shrink-0 font-medium">
                <lucide-icon name="clock" class="size-3"></lucide-icon>
                <span>{{ getRelativeTime(log.createdAt) }}</span>
              </div>
            </div>
            <div class="bg-surface-bone border border-hairline rounded-md p-md">
              <p class="text-caption text-charcoal m-0">{{ log.details }}</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Pagination -->
      <div *ngIf="!isLoading() && logs().length > 0" class="flex items-center justify-between border-t border-hairline pt-md mt-md">
        <span class="text-caption text-mute font-medium">
          Showing {{ (currentPage() - 1) * limit + 1 }}–{{ minVal(currentPage() * limit, totalElements()) }} of {{ totalElements() }} entries
        </span>
        <div class="flex items-center gap-sm">
          <button (click)="changePage(-1)" [disabled]="currentPage() === 1 || isLoading()"
            class="button-outline px-md py-sm">
            <lucide-icon name="chevron-left" class="size-3.5"></lucide-icon> Previous
          </button>
          <button (click)="changePage(1)" [disabled]="currentPage() >= totalPages() || isLoading()"
            class="button-outline px-md py-sm">
            Next <lucide-icon name="chevron-right" class="size-3.5"></lucide-icon>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class ActivitiesLogComponent implements OnInit {
  activityLogService = inject(ActivityLogService);

  logs = signal<ActivityLog[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  totalElements = signal(0);
  limit = 10;
  isLoading = signal(false);

  ngOnInit() { this.loadLogs(); }

  loadLogs() {
    this.isLoading.set(true);
    this.activityLogService.getLogs(this.currentPage(), this.limit).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements ?? res.totalItems ?? 0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  changePage(delta: number) {
    const np = this.currentPage() + delta;
    if (np >= 1 && np <= this.totalPages()) {
      this.currentPage.set(np);
      this.loadLogs();
    }
  }

  minVal(a: number, b: number) { return Math.min(a, b); }

  getRelativeTime(dateStr: string): string {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `about ${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `about ${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}

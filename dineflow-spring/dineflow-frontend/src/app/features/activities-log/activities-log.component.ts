import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log.service';
import { LucideAngularModule, Clock, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-activities-log',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <lucide-icon name="clock" [size]="20"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black uppercase tracking-tight text-foreground m-0">Activity Log</h1>
            <p class="text-sm text-muted-foreground m-0">A timeline of recent system events and user actions.</p>
          </div>
        </div>
        <!-- Pagination top-right -->
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <button (click)="changePage(-1)" [disabled]="currentPage() === 1 || isLoading()"
            class="p-1.5 hover:text-foreground disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors">
            <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
          </button>
          <span class="font-medium text-foreground">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button (click)="changePage(1)" [disabled]="currentPage() >= totalPages() || isLoading()"
            class="p-1.5 hover:text-foreground disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors">
            <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading() && logs().length === 0"
        class="text-center text-muted-foreground py-16 border-2 border-dashed border-border rounded-xl">
        No activity logs found.
      </div>

      <!-- Timeline Feed -->
      <div *ngIf="!isLoading() && logs().length > 0" class="flex flex-col gap-0">
        <div *ngFor="let log of logs(); let last = last" class="flex gap-4 pb-6 relative">

          <!-- Timeline dot + vertical line -->
          <div class="flex flex-col items-center shrink-0 pt-1">
            <div class="size-3 rounded-full bg-primary shrink-0 mt-0.5 ring-2 ring-primary/20"></div>
            <div *ngIf="!last" class="w-px flex-1 bg-border/60 mt-1.5 min-h-[2rem]"></div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pb-2">
            <div class="flex items-center justify-between mb-2 gap-2">
              <span class="font-black text-sm text-foreground uppercase tracking-wider">{{ log.action }}</span>
              <div class="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <lucide-icon name="clock" [size]="12"></lucide-icon>
                <span>{{ getRelativeTime(log.createdAt) }}</span>
              </div>
            </div>
            <div class="bg-muted/40 border border-border rounded-lg px-4 py-3">
              <p class="text-sm text-muted-foreground m-0">{{ log.details }}</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Pagination -->
      <div *ngIf="!isLoading() && logs().length > 0" class="flex items-center justify-between border-t border-border pt-4">
        <span class="text-sm text-muted-foreground">
          Showing {{ (currentPage() - 1) * limit + 1 }}–{{ minVal(currentPage() * limit, totalElements()) }} of {{ totalElements() }} entries
        </span>
        <div class="flex items-center gap-2">
          <button (click)="changePage(-1)" [disabled]="currentPage() === 1 || isLoading()"
            class="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-40 transition-colors bg-transparent cursor-pointer text-foreground">
            <lucide-icon name="chevron-left" [size]="14"></lucide-icon> Previous
          </button>
          <button (click)="changePage(1)" [disabled]="currentPage() >= totalPages() || isLoading()"
            class="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-40 transition-colors bg-transparent cursor-pointer text-foreground">
            Next <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
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

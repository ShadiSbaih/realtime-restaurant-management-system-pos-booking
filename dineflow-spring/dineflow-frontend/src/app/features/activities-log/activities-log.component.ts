import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogService, ActivityLog } from '../../core/services/activity-log.service';
import { LucideAngularModule, Activity, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-activities-log',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col gap-6 w-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <lucide-icon name="activity" [size]="28" class="text-primary"></lucide-icon>
            Activities Log
          </h2>
          <p class="text-muted-foreground mt-1">View system activity and audit logs.</p>
        </div>
      </div>
      
      <div class="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0">
              <tr>
                <th class="px-6 py-4 font-medium">Action</th>
                <th class="px-6 py-4 font-medium">Details</th>
                <th class="px-6 py-4 font-medium">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="isLoading()" class="border-b border-border">
                <td colspan="3" class="px-6 py-8 text-center text-muted-foreground">Loading logs...</td>
              </tr>
              <tr *ngIf="!isLoading() && logs().length === 0" class="border-b border-border">
                <td colspan="3" class="px-6 py-8 text-center text-muted-foreground">No activities found.</td>
              </tr>
              <tr *ngFor="let log of logs()" class="border-b border-border hover:bg-muted/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-6 py-4 text-foreground">{{ log.details }}</td>
                <td class="px-6 py-4 text-muted-foreground whitespace-nowrap">{{ log.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="border-t border-border p-4 flex items-center justify-between bg-card">
          <span class="text-sm text-muted-foreground">
            Showing <span class="font-medium text-foreground">{{ (currentPage() - 1) * limit + 1 }}</span> to 
            <span class="font-medium text-foreground">{{ min(currentPage() * limit, totalElements()) }}</span> of 
            <span class="font-medium text-foreground">{{ totalElements() }}</span> entries
          </span>
          <div class="flex gap-2">
            <button (click)="changePage(-1)" [disabled]="currentPage() === 1 || isLoading()" 
                    class="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors">
              <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
            </button>
            <button (click)="changePage(1)" [disabled]="currentPage() >= totalPages() || isLoading()" 
                    class="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors">
              <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
            </button>
          </div>
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
  
  readonly Activity = Activity;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  ngOnInit() {
    this.loadLogs();
  }
  
  loadLogs() {
    this.isLoading.set(true);
    this.activityLogService.getLogs(this.currentPage(), this.limit).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  changePage(delta: number) {
    const newPage = this.currentPage() + delta;
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
      this.loadLogs();
    }
  }
  
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}

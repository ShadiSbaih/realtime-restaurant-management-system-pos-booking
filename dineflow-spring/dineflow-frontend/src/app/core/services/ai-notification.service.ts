import { Injectable, effect } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { AiService, AiJob, AiProgressEvent } from './ai.service';
import { ToastService } from './toast.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

/**
 * Global AI notification hub.
 *
 * - Pushes toast notifications when AI jobs complete or fail, even if the
 *   user has closed the AI modal or navigated to another page.
 * - Recovers in-progress jobs after a refresh / reconnect by polling the
 *   backend until they reach a terminal state.
 */
@Injectable({ providedIn: 'root' })
export class AiNotificationService {
  private notifiedJobIds = new Set<string>();
  private recoverySubs: Subscription[] = [];

  constructor(
    private wsService: WebsocketService,
    private aiService: AiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.listenToWebSocket();

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.recoverRecentJobs();
      }
    });

    // Re-poll after every reconnect in case a job finished while we were offline.
    this.wsService.connected$.subscribe(() => {
      if (this.authService.currentUser()) {
        this.recoverRecentJobs();
      }
    });
  }

  private listenToWebSocket() {
    effect(() => {
      const event = this.wsService.aiActionEvent() as AiProgressEvent | null;
      if (!event) return;

      if (event.status === 'COMPLETED') {
        this.markNotified(event.jobId);
        const name = this.extractName(event.result);
        this.toastService.success(
          name ? `AI dish "${name}" is ready — open the AI studio to review.`
               : 'AI generation complete — open the AI studio to review.'
        );
      } else if (event.status === 'FAILED') {
        this.markNotified(event.jobId);
        this.toastService.error(event.message || 'AI generation failed.');
      }
    });
  }

  private recoverRecentJobs() {
    // Clean up previous recovery listeners; the backend endpoint
    // returns the most recent jobs, so this re-runs after reconnect.
    this.recoverySubs.forEach(s => s.unsubscribe());
    this.recoverySubs = [];

    this.aiService.getRecentJobs().subscribe(jobs => {
      for (const job of jobs) {
        if (this.isTerminal(job.status)) {
          this.notifyFromJob(job);
          continue;
        }
        const sub = this.aiService.pollJobUntilDone(job.id).subscribe({
          next: polled => {
            if (this.isTerminal(polled.status)) {
              this.notifyFromJob(polled);
            }
          },
          error: () => {}
        });
        this.recoverySubs.push(sub);
      }
    });
  }

  private notifyFromJob(job: AiJob) {
    if (!job.id || this.notifiedJobIds.has(job.id)) return;
    this.markNotified(job.id);

    if (job.status === 'DONE') {
      const name = this.extractName(job.resultPayload);
      this.toastService.success(
        name ? `AI dish "${name}" finished while you were away.`
             : 'AI job finished.'
      );
    } else if (job.status === 'FAILED') {
      const error = job.resultPayload?.['error'];
      this.toastService.error(error || 'AI job failed.');
    }
  }

  private isTerminal(status: AiJob['status']) {
    return status === 'DONE' || status === 'FAILED';
  }

  private markNotified(jobId?: string | null) {
    if (jobId) this.notifiedJobIds.add(jobId);
  }

  private extractName(result: any): string | undefined {
    if (!result) return undefined;
    return result.name ?? result.newName ?? result.newItemName;
  }
}

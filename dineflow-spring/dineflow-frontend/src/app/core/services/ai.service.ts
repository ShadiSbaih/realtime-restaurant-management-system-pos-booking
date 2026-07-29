import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../models/menu.model';

export interface AiStartResponse {
  jobId: string;
  message: string;
}

export interface AiJob {
  id: string;
  type: 'FEEDBACK_ANALYZER' | 'MENU_ITEM_GENERATOR';
  status: 'RUNNING' | 'DONE' | 'FAILED';
  resultPayload: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** The WebSocket event payload broadcast on /topic/ai-jobs/{userId} */
export interface AiProgressEvent {
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  message: string;
  result?: MenuItem | null;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly base = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  // ─── Smart Menu: Feedback Analysis ────────────────────────────────────────

  /**
   * Start feedback analysis on a menu item.
   * @param itemId     UUID of the item
   * @param refinement Optional chef instruction (if provided, refines the recipe)
   */
  startFeedbackAnalysis(itemId: string, refinement?: string): Observable<AiStartResponse> {
    const body: Record<string, string> = { itemId };
    if (refinement && refinement.trim()) {
      body['refinement'] = refinement.trim();
    }
    return this.http.post<AiStartResponse>(`${this.base}/smart-menu`, body);
  }

  // ─── Generate Menu Item ───────────────────────────────────────────────────

  /**
   * Generate a new menu item from a custom prompt or top-selling data.
   * @param prompt      Optional chef prompt
   * @param constraints Optional comma-separated dietary constraints
   */
  generateMenuItem(prompt?: string, constraints?: string): Observable<AiStartResponse> {
    const body: Record<string, string> = {};
    if (prompt && prompt.trim()) body['prompt'] = prompt.trim();
    if (constraints && constraints.trim()) body['constraints'] = constraints.trim();
    return this.http.post<AiStartResponse>(`${this.base}/generate-item`, body);
  }

  // ─── Dashboard Insights (Synchronous) ─────────────────────────────────────

  generateBriefing(): Observable<{ briefing: string }> {
    return this.http.post<{ briefing: string }>(`${this.base}/generate-briefing`, {});
  }

  generateForecast(): Observable<{ forecast: string }> {
    return this.http.post<{ forecast: string }>(`${this.base}/generate-forecast`, {});
  }

  // ─── Job Status Poll (HTTP fallback) ─────────────────────────────────────

  /**
   * Poll a job until it reaches a terminal state (DONE or FAILED).
   * Use this as fallback if WebSocket is unavailable.
   */
  pollJobUntilDone(jobId: string): Observable<AiJob> {
    return interval(2000).pipe(
      switchMap(() => this.http.get<AiJob>(`${this.base}/jobs/${jobId}`)),
      takeWhile(job => job.status === 'RUNNING', true)
    );
  }
}

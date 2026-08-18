import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Global toast state.
 * AppComponent renders the queue; any service can push a notification.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  public toasts = this._toasts.asReadonly();

  show(message: string, type: Toast['type'] = 'info', durationMs = 4500) {
    const id = Date.now() + Math.random();
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), durationMs);
  }

  success(message: string, durationMs = 4500) {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 6000) {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 4500) {
    this.show(message, 'info', durationMs);
  }

  remove(id: number) {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}

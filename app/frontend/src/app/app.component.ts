import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './core/services/websocket.service';
import { ToastService } from './core/services/toast.service';
import { AiNotificationService } from './core/services/ai-notification.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, Zap, X as XIcon } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'savora-frontend';

  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Zap = Zap;
  readonly XIcon = XIcon;

  constructor(
    private wsService: WebsocketService,
    public toastService: ToastService,
    private aiNotifications: AiNotificationService
  ) {}

  ngOnInit() {
    this.wsService.connect();

    // Globally override window.alert to render our custom artisan toasts!
    window.alert = (message: string) => {
      let type: 'success' | 'error' | 'info' = 'info';
      const msgLower = message.toLowerCase();

      if (msgLower.includes('success') || msgLower.includes('added') || msgLower.includes('sent') || msgLower.includes('created')) {
        type = 'success';
      } else if (msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('cannot') || msgLower.includes('invalid')) {
        type = 'error';
      }

      this.toastService.show(message, type);
    };
  }

  removeToast(id: number) {
    this.toastService.remove(id);
  }
}

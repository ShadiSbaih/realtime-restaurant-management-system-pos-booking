import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'dineflow-frontend';
  
  toasts = signal<Toast[]>([]);

  constructor(private wsService: WebsocketService) {}

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
      
      const id = Date.now() + Math.random();
      this.toasts.update(t => [...t, { id, message, type }]);
      
      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        this.removeToast(id);
      }, 4500);
    };
  }
  
  removeToast(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}

import { Injectable, signal, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;
  
  // Signals for components to react to
  public newOrderEvent = signal<any>(null);
  public orderStatusEvent = signal<any>(null);
  public menuUpdateEvent = signal<any>(null);
  public tableUpdateEvent = signal<any>(null);
  public reservationEvent = signal<any>(null);
  public paymentEvent = signal<any>(null);
  public aiActionEvent = signal<any>(null);

  /** Fires every time the STOMP client (re)connects. */
  public connected$ = new Subject<void>();

  constructor(private authService: AuthService) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket STOMP server');
      this.subscribeToTopics();
      this.connected$.next();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    effect(() => {
      const user = this.authService.currentUser();
      if (user && this.client.active) {
        this.subscribeToUserAi(user.id);
      }
    });
  }

  connect(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  private subscribeToTopics(): void {
    // Orders
    this.client.subscribe('/topic/orders', (message: Message) => {
      this.newOrderEvent.set(JSON.parse(message.body));
    });
    this.client.subscribe('/topic/orders/status', (message: Message) => {
      this.orderStatusEvent.set(JSON.parse(message.body));
    });

    // Menu
    this.client.subscribe('/topic/menu', (message: Message) => {
      this.menuUpdateEvent.set(JSON.parse(message.body));
    });

    // Tables
    this.client.subscribe('/topic/tables', (message: Message) => {
      this.tableUpdateEvent.set(JSON.parse(message.body));
    });

    // Reservations
    this.client.subscribe('/topic/reservations', (message: Message) => {
      this.reservationEvent.set(JSON.parse(message.body));
    });

    // Payments
    this.client.subscribe('/topic/payments', (message: Message) => {
      this.paymentEvent.set(JSON.parse(message.body));
    });

    // AI Actions (User Specific)
    const user = this.authService.currentUser();
    if (user) {
      this.subscribeToUserAi(user.id);
    }
  }

  private currentAiSub: any = null;

  public subscribeToUserAi(userId: string): void {
    if (this.client.active) {
      try {
        if (this.currentAiSub) {
          this.currentAiSub.unsubscribe();
        }
        this.currentAiSub = this.client.subscribe(`/topic/ai-jobs/${userId}`, (message: Message) => {
          this.aiActionEvent.set(JSON.parse(message.body));
        });
      } catch (e) {
        console.warn('AI topic subscription warning:', e);
      }
    }
  }
}

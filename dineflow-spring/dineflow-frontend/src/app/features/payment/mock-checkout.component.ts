import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, CreditCard, CheckCircle2, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-mock-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground m-0">Complete Payment</h3>
          <button class="text-muted-foreground hover:text-foreground transition-colors" (click)="cancel.emit()">
            <lucide-icon name="x-circle" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <div class="p-6">
          <div class="text-center mb-6">
            <span class="block text-sm text-muted-foreground mb-1">Total to pay</span>
            <span class="block text-4xl font-bold text-foreground">\${{ amount | number:'1.2-2' }}</span>
          </div>
          
          <div *ngIf="!isSuccess() && !isFailed()" class="flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Card Number (Simulation)</label>
              <div class="flex items-center bg-background border border-input rounded-md px-3 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
                <lucide-icon name="credit-card" [size]="18" class="text-muted-foreground"></lucide-icon>
                <input type="text" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" 
                       class="flex-1 bg-transparent border-none outline-none py-2 px-2 text-foreground text-sm">
              </div>
              <p class="text-xs text-muted-foreground mt-1.5">Type any numbers. This is a local mock simulation.</p>
            </div>
            
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-foreground mb-1.5">Expiry</label>
                <input type="text" placeholder="MM/YY" class="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-foreground mb-1.5">CVC</label>
                <input type="text" placeholder="123" class="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
              </div>
            </div>
            
            <div class="flex items-center gap-2 mt-2">
              <input type="checkbox" id="forceSuccess" [(ngModel)]="forceSuccess" class="rounded border-input text-primary focus:ring-primary size-4">
              <label for="forceSuccess" class="text-sm text-foreground cursor-pointer select-none">Force Success (Bypass 10% fail rate)</label>
            </div>
            
            <button class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-md shadow-sm transition-colors mt-2 disabled:opacity-50 flex justify-center items-center gap-2" 
                    [disabled]="isProcessing()" (click)="processPayment()">
              <span *ngIf="!isProcessing()">Pay \${{ amount | number:'1.2-2' }}</span>
              <span *ngIf="isProcessing()" class="flex items-center gap-2">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            </button>
          </div>
          
          <!-- Success State -->
          <div *ngIf="isSuccess()" class="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
            <div class="size-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
              <lucide-icon name="check-circle-2" [size]="32"></lucide-icon>
            </div>
            <h4 class="text-xl font-bold text-foreground mb-2">Payment Successful!</h4>
            <p class="text-muted-foreground text-center mb-6">The order has been confirmed and paid.</p>
            <button class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-md transition-colors" (click)="success.emit()">
              Back to POS
            </button>
          </div>
          
          <!-- Failed State -->
          <div *ngIf="isFailed()" class="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
            <div class="size-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <lucide-icon name="x-circle" [size]="32"></lucide-icon>
            </div>
            <h4 class="text-xl font-bold text-foreground mb-2">Payment Failed</h4>
            <p class="text-muted-foreground text-center mb-6">{{ failureReason() }}</p>
            <button class="w-full bg-secondary text-secondary-foreground border border-input hover:bg-secondary/80 font-medium py-2.5 rounded-md transition-colors" (click)="retry()">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MockCheckoutComponent {
  @Input() amount!: number;
  @Input() orderId!: string;
  @Output() success = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  cardNumber = '4242 4242 4242 4242';
  forceSuccess = false;
  
  isProcessing = signal(false);
  isSuccess = signal(false);
  isFailed = signal(false);
  failureReason = signal('');
  
  readonly CreditCard = CreditCard;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;

  constructor(private http: HttpClient) {}

  processPayment() {
    this.isProcessing.set(true);
    
    this.http.post<any>(`${environment.apiUrl}/payments/intent`, {
      orderId: this.orderId,
      amount: this.amount,
      cardLast4: this.cardNumber.slice(-4) || '4242'
    }).subscribe({
      next: (intent) => {
        this.http.post<any>(`${environment.apiUrl}/payments/confirm`, {
          paymentId: intent.paymentId,
          forceSuccess: this.forceSuccess
        }).subscribe({
          next: (result) => {
            this.isProcessing.set(false);
            if (result.status === 'SUCCEEDED') {
              this.isSuccess.set(true);
            } else {
              this.isFailed.set(true);
              this.failureReason.set(result.failureReason || 'Card declined');
            }
          },
          error: () => {
            this.isProcessing.set(false);
            this.isFailed.set(true);
            this.failureReason.set('Network error during confirmation');
          }
        });
      },
      error: () => {
        this.isProcessing.set(false);
        this.isFailed.set(true);
        this.failureReason.set('Failed to initialize payment');
      }
    });
  }

  retry() {
    this.isFailed.set(false);
    this.failureReason.set('');
  }
}

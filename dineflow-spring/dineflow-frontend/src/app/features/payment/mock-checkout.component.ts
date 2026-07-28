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
    <div class="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div class="bg-canvas w-full max-w-md rounded-md border border-hairline shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex items-center justify-between px-xl py-md border-b border-hairline bg-surface-bone">
          <h3 class="text-heading-sm font-bold text-ink m-0">Complete Payment</h3>
          <button class="text-mute hover:text-ink transition-colors border-none bg-transparent cursor-pointer p-0" (click)="cancel.emit()">
            <lucide-icon name="x-circle" class="size-5"></lucide-icon>
          </button>
        </div>
        
        <div class="p-xl bg-canvas">
          <div class="text-center mb-xl">
            <span class="block text-caption text-mute mb-xs">Total to pay</span>
            <span class="block text-heading-lg font-bold text-ink">\${{ amount | number:'1.2-2' }}</span>
          </div>
          
          <div *ngIf="!isSuccess() && !isFailed()" class="flex flex-col gap-md">
            <div>
              <label class="block text-caption font-bold text-ink mb-xs">Card Number (Simulation)</label>
              <div class="flex items-center bg-canvas border border-hairline rounded-md px-sm focus-within:border-[#333] transition-colors">
                <lucide-icon name="credit-card" class="size-4 text-mute"></lucide-icon>
                <input type="text" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" 
                       class="flex-1 bg-transparent border-none outline-none py-sm px-xs text-ink text-body-sm">
              </div>
              <p class="text-caption-tight text-mute mt-xs">Type any numbers. This is a local mock simulation.</p>
            </div>
            
            <div class="flex gap-md">
              <div class="flex-1">
                <label class="block text-caption font-bold text-ink mb-xs">Expiry</label>
                <input type="text" placeholder="MM/YY" class="w-full bg-canvas border border-hairline rounded-md px-sm py-xs text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors">
              </div>
              <div class="flex-1">
                <label class="block text-caption font-bold text-ink mb-xs">CVC</label>
                <input type="text" placeholder="123" class="w-full bg-canvas border border-hairline rounded-md px-sm py-xs text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors">
              </div>
            </div>
            
            <div class="flex items-center gap-xs mt-sm">
              <input type="checkbox" id="forceSuccess" [(ngModel)]="forceSuccess" class="rounded border-hairline text-primary focus:ring-primary size-4">
              <label for="forceSuccess" class="text-caption text-ink cursor-pointer select-none">Force Success (Bypass fail rate)</label>
            </div>
            
            <button class="w-full button-dark mt-sm disabled:opacity-50 flex justify-center items-center gap-xs" 
                    [disabled]="isProcessing()" (click)="processPayment()">
              <span *ngIf="!isProcessing()">Pay \${{ amount | number:'1.2-2' }}</span>
              <span *ngIf="isProcessing()" class="flex items-center gap-xs">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-canvas" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            </button>
          </div>
          
          <!-- Success State -->
          <div *ngIf="isSuccess()" class="flex flex-col items-center justify-center py-xl animate-in zoom-in duration-300">
            <div class="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-md border border-primary/20">
              <lucide-icon name="check-circle-2" class="size-8"></lucide-icon>
            </div>
            <h4 class="text-heading-md font-bold text-ink mb-xs">Payment Successful!</h4>
            <p class="text-body-sm text-mute text-center mb-xl">The order has been confirmed and paid.</p>
            <button class="w-full button-dark" (click)="success.emit()">
              Back to POS
            </button>
          </div>
          
          <!-- Failed State -->
          <div *ngIf="isFailed()" class="flex flex-col items-center justify-center py-xl animate-in zoom-in duration-300">
            <div class="size-16 rounded-full bg-[#e02424]/10 text-[#e02424] flex items-center justify-center mb-md border border-[#e02424]/20">
              <lucide-icon name="x-circle" class="size-8"></lucide-icon>
            </div>
            <h4 class="text-heading-md font-bold text-ink mb-xs">Payment Failed</h4>
            <p class="text-body-sm text-mute text-center mb-xl">{{ failureReason() }}</p>
            <button class="w-full button-outline" (click)="retry()">
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

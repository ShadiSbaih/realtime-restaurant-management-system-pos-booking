import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { Table, TableStatus } from '../../core/models/table.model';
import { OrderType, PaymentMethod } from '../../core/models/order.model';
import { MockCheckoutComponent } from '../payment/mock-checkout.component';
import { LucideAngularModule, Search, Plus, Minus, Trash2, CreditCard, ChevronLeft, ChevronRight, X } from 'lucide-angular';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MockCheckoutComponent],
  template: `
    <div class="flex h-full gap-0 overflow-hidden">

      <!-- Left: Menu Catalog -->
      <div class="flex-1 flex flex-col overflow-hidden border-r border-border pr-0">
        
        <!-- Header + Search -->
        <div class="p-5 pb-3 border-b border-border bg-card/50">
          <h1 class="text-xl font-black text-foreground m-0 mb-4">New Order</h1>
          <div class="relative">
            <lucide-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
              placeholder="Search Item..."
              class="w-full pl-9 pr-4 h-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors" />
            <span *ngIf="unavailableCount > 0"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">
              {{ unavailableCount }} items unavailable
            </span>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center gap-2 px-5 py-3 border-b border-border overflow-x-auto hide-scrollbar shrink-0">
          <button (click)="selectedCategory.set(null)"
            class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap cursor-pointer"
            [class.bg-primary]="!selectedCategory()"
            [class.text-primary-foreground]="!selectedCategory()"
            [class.border-primary]="!selectedCategory()"
            [class.bg-transparent]="selectedCategory()"
            [class.text-muted-foreground]="selectedCategory()"
            [class.border-border]="selectedCategory()">All</button>
          <button *ngFor="let cat of categories()"
            (click)="selectedCategory.set(cat.id)"
            class="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap cursor-pointer"
            [class.bg-primary]="selectedCategory() === cat.id"
            [class.text-primary-foreground]="selectedCategory() === cat.id"
            [class.border-primary]="selectedCategory() === cat.id"
            [class.bg-transparent]="selectedCategory() !== cat.id"
            [class.text-muted-foreground]="selectedCategory() !== cat.id"
            [class.border-border]="selectedCategory() !== cat.id">
            {{ cat.name }}
          </button>
        </div>

        <!-- Items Grid -->
        <div class="flex-1 overflow-y-auto p-5">
          <div *ngIf="isLoading" class="flex items-center justify-center h-40">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div *ngFor="let item of filteredItems()"
              (click)="addToCart(item)"
              class="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
              [class.opacity-40]="!item.isAvailable"
              [class.pointer-events-none]="!item.isAvailable">
              <!-- Image -->
              <div class="relative h-36 bg-muted overflow-hidden">
                <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div class="absolute top-2 left-2 bg-black/70 text-white text-xs font-black px-2 py-1 rounded-lg">
                  \${{ item.price | number:'1.2-2' }}
                </div>
                <div *ngIf="item.discount > 0" class="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                  -{{ calcDiscount(item) }}%
                </div>
              </div>
              <!-- Details -->
              <div class="p-3">
                <h3 class="font-black text-sm text-foreground uppercase leading-tight m-0 mb-0.5">{{ item.name }}</h3>
                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0">Fresh Ingredients</p>
                <div *ngIf="item.discount > 0" class="mt-1">
                  <span class="text-xs text-muted-foreground line-through">\${{ item.price + item.discount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Order Summary -->
      <div class="w-72 xl:w-80 flex flex-col bg-card border-l border-border overflow-hidden shrink-0">
        
        <!-- Summary Header -->
        <div class="p-4 border-b border-border">
          <h2 class="font-black text-primary uppercase tracking-widest text-sm m-0 mb-3">Order Summary</h2>
          <!-- Order Type Toggle -->
          <div class="grid grid-cols-2 gap-1 bg-muted rounded-lg p-1">
            <button (click)="orderType.set('DINE_IN')"
              class="py-2 rounded-md text-xs font-black uppercase tracking-wider transition-colors border-none cursor-pointer"
              [class.bg-primary]="orderType() === 'DINE_IN'"
              [class.text-white]="orderType() === 'DINE_IN'"
              [class.bg-transparent]="orderType() !== 'DINE_IN'"
              [class.text-muted-foreground]="orderType() !== 'DINE_IN'">
              Dine In
            </button>
            <button (click)="orderType.set('TAKEAWAY')"
              class="py-2 rounded-md text-xs font-black uppercase tracking-wider transition-colors border-none cursor-pointer"
              [class.bg-primary]="orderType() === 'TAKEAWAY'"
              [class.text-white]="orderType() === 'TAKEAWAY'"
              [class.bg-transparent]="orderType() !== 'TAKEAWAY'"
              [class.text-muted-foreground]="orderType() !== 'TAKEAWAY'">
              Take Away
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-3">
          <div *ngIf="cart().length === 0" class="flex items-center justify-center h-24 text-muted-foreground text-xs">
            Add items to start an order
          </div>
          <div *ngFor="let item of cart(); let i = index" class="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
            <div class="size-10 rounded-md bg-cover bg-center border border-border shrink-0"
              [style.backgroundImage]="'url(' + (item.menuItem.image || '/hero.png') + ')'"></div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-xs text-foreground m-0 truncate">{{ item.menuItem.name }}</p>
              <p class="text-xs text-primary font-bold m-0">\${{ item.menuItem.price | number:'1.2-2' }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button (click)="updateQty(i, -1)" class="size-6 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 border-none cursor-pointer text-sm font-bold">-</button>
              <span class="w-5 text-center text-xs font-bold text-foreground">{{ item.quantity }}</span>
              <button (click)="updateQty(i, 1)" class="size-6 rounded-md bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 border-none cursor-pointer text-sm font-bold">+</button>
            </div>
            <button (click)="removeFromCart(i)" class="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive border-none bg-transparent cursor-pointer shrink-0">
              <lucide-icon name="trash-2" [size]="13"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-border flex flex-col gap-3">
          <!-- Total -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-black uppercase tracking-wider text-muted-foreground">Total</span>
            <span class="text-xl font-black text-primary">\${{ cartTotal() | number:'1.2-2' }}</span>
          </div>

          <!-- Selected Table indicator -->
          <div *ngIf="selectedTable()" class="text-xs text-muted-foreground flex items-center justify-between">
            <span>Table: <strong class="text-foreground">{{ selectedTable()?.name }}</strong></span>
            <button (click)="selectedTable.set(null)" class="text-primary hover:underline bg-transparent border-none cursor-pointer text-xs">Change</button>
          </div>

          <!-- Select Table -->
          <button *ngIf="orderType() === 'DINE_IN'" (click)="showTablePicker.set(true)"
            class="w-full py-3 border border-border rounded-xl text-sm font-black text-foreground hover:bg-muted transition-colors bg-transparent cursor-pointer">
            {{ selectedTable() ? 'Change Table' : 'Select Table' }}
          </button>

          <!-- Place Order -->
          <button (click)="placeOrder('CASH')"
            [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
            class="w-full py-3 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-colors border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            <lucide-icon name="credit-card" [size]="15"></lucide-icon>
            {{ isSubmitting() ? 'Placing...' : 'Place Order' }}
          </button>

          <!-- Pay with card -->
          <button (click)="placeOrder('CARD')"
            [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
            class="w-full py-3 bg-foreground text-background rounded-xl text-sm font-black hover:opacity-90 transition-colors border-none cursor-pointer disabled:opacity-50">
            Pay Securely with Stripe
          </button>
        </div>
      </div>

      <!-- Table Picker Modal -->
      <div *ngIf="showTablePicker()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl">
          <div class="p-4 border-b border-border flex items-center justify-between">
            <h3 class="font-black text-foreground m-0">Select a Table</h3>
            <button (click)="showTablePicker.set(false)" class="border-none bg-transparent text-muted-foreground hover:text-foreground cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="p-4 flex flex-wrap gap-4 max-h-72 overflow-y-auto">
            <button *ngFor="let table of availableTables()"
              (click)="selectTable(table)"
              class="flex flex-col items-center justify-center font-black text-sm border-2 transition-all cursor-pointer"
              [ngClass]="{
                'rounded-full size-16': table.shape === 'circle',
                'rounded-xl size-16': table.shape === 'square',
                'rounded-xl w-24 h-16': table.shape === 'rectangle',
                'bg-primary/20 border-primary text-foreground hover:bg-primary/30': true
              }">
              {{ table.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mock Checkout -->
      <app-mock-checkout *ngIf="showCheckout()"
        [amount]="cartTotal()" [orderId]="currentOrderId()"
        (success)="onPaymentSuccess()" (cancel)="showCheckout.set(false)">
      </app-mock-checkout>

    </div>
  `,
  styles: []
})
export class NewOrderComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  tables = signal<Table[]>([]);
  cart = signal<{menuItem: MenuItem, quantity: number}[]>([]);
  orderType = signal<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  selectedCategory = signal<string | null>(null);
  selectedTable = signal<Table | null>(null);
  showTablePicker = signal(false);
  showCheckout = signal(false);
  currentOrderId = signal('');
  isSubmitting = signal(false);
  isLoading = false;
  searchQuery = '';
  unavailableCount = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private tableService: TableService
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(q => this.loadMenu(q));
  }

  ngOnInit() {
    this.loadMenu();
    this.menuService.getCategories().subscribe(c => this.categories.set(c));
    this.tableService.getTables().subscribe(t => this.tables.set(t));
  }

  loadMenu(search = '') {
    this.isLoading = true;
    this.menuService.getMenuItems(1, 100, undefined, search || undefined).subscribe(res => {
      this.menuItems.set(res.data);
      this.unavailableCount = res.data.filter(i => !i.isAvailable).length;
      this.isLoading = false;
    });
  }

  onSearch(q: string) { this.searchSubject.next(q); }

  filteredItems(): MenuItem[] {
    const cat = this.selectedCategory();
    let items = this.menuItems();
    if (cat) items = items.filter(i => i.categoryId === cat || i.category?.id === cat);
    return items;
  }

  availableTables(): Table[] {
    return this.tables().filter(t => t.status === TableStatus.AVAILABLE);
  }

  addToCart(item: MenuItem) {
    if (!item.isAvailable) return;
    this.cart.update(c => {
      const ex = c.find(x => x.menuItem.id === item.id);
      if (ex) return c.map(x => x.menuItem.id === item.id ? {...x, quantity: x.quantity + 1} : x);
      return [...c, {menuItem: item, quantity: 1}];
    });
  }

  updateQty(i: number, delta: number) {
    this.cart.update(c => {
      const updated = [...c];
      updated[i] = {...updated[i], quantity: updated[i].quantity + delta};
      if (updated[i].quantity <= 0) updated.splice(i, 1);
      return updated;
    });
  }

  removeFromCart(i: number) {
    this.cart.update(c => c.filter((_, idx) => idx !== i));
  }

  cartTotal(): number {
    return this.cart().reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  }

  calcDiscount(item: MenuItem): number {
    return Math.round((item.discount / (item.price + item.discount)) * 100);
  }

  selectTable(table: Table) {
    this.selectedTable.set(table);
    this.showTablePicker.set(false);
  }

  placeOrder(method: 'CASH' | 'CARD') {
    if (!this.cart().length) return;
    if (this.orderType() === 'DINE_IN' && !this.selectedTable()) { alert('Please select a table first.'); return; }
    this.isSubmitting.set(true);
    this.orderService.createOrder({
      orderType: this.orderType() === 'DINE_IN' ? OrderType.DINE_IN : OrderType.TAKEAWAY,
      tableId: this.selectedTable()?.id,
      paymentMethod: method === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH,
      items: this.cart().map(c => ({menuItemId: c.menuItem.id, quantity: c.quantity}))
    }).subscribe({
      next: (order) => {
        this.isSubmitting.set(false);
        if (method === 'CARD') { this.currentOrderId.set(order.id); this.showCheckout.set(true); }
        else { this.cart.set([]); this.selectedTable.set(null); alert('Order placed!'); }
      },
      error: (err) => { this.isSubmitting.set(false); alert(err.error?.message || 'Failed'); }
    });
  }

  onPaymentSuccess() {
    this.showCheckout.set(false);
    this.cart.set([]);
    this.selectedTable.set(null);
  }
}

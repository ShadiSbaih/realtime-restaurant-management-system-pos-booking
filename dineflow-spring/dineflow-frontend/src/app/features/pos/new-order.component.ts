import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { Table, TableStatus } from '../../core/models/table.model';
import { OrderType, PaymentMethod } from '../../core/models/order.model';
import { MockCheckoutComponent } from '../payment/mock-checkout.component';
import { LucideAngularModule, Search, Plus, Minus, Trash2, CreditCard, ChevronLeft, ChevronRight, X, ShoppingBag, Utensils, DollarSign, Check, AlertCircle, Sparkles, Layers, Coffee, ArrowRight } from 'lucide-angular';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MockCheckoutComponent],
  template: `
    <div class="flex h-full gap-xl overflow-hidden w-full bg-canvas">

      <!-- Left Panel: Smart Menu Catalog & Terminal -->
      <div class="flex-1 flex flex-col overflow-hidden bg-surface-bone rounded-md border border-hairline shadow-sm">
        
        <!-- Terminal Top Header & Search Bar -->
        <div class="p-xl pb-md border-b border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
          <div class="flex items-center gap-md">
            <div class="p-sm rounded-md bg-canvas text-primary border border-hairline">
              <lucide-icon name="utensils" class="size-6"></lucide-icon>
            </div>
            <div>
              <h1 class="text-heading-md font-bold text-ink m-0 tracking-tight flex items-center gap-sm">
                <span>POS Order Terminal</span>
                <span class="px-xs py-0.5 rounded-md text-caption-tight font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Active
                </span>
              </h1>
              <p class="text-body-sm text-mute m-0 mt-xs">Select items from the catalog or search by name</p>
            </div>
          </div>

          <!-- Quick Search Bar -->
          <div class="relative w-full sm:w-[280px]">
            <lucide-icon name="search" class="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
              placeholder="Search dishes, drinks, desserts..."
              class="w-full pl-[36px] pr-8 h-[40px] rounded-md border border-hairline bg-canvas text-body-sm text-ink focus:outline-none focus:border-[#333] transition-colors placeholder:text-mute" />
            <button *ngIf="searchQuery" (click)="clearSearch()" class="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-surface-bone text-mute hover:text-ink flex items-center justify-center border-none cursor-pointer">
              <lucide-icon name="x" class="size-3"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Category Filter Pills Bar -->
        <div class="flex items-center gap-sm px-xl py-md border-b border-hairline overflow-x-auto custom-scrollbar shrink-0 bg-canvas">
          <button (click)="selectedCategory.set(null)"
            class="px-md py-sm rounded-md text-caption-tight font-bold uppercase border transition-all whitespace-nowrap cursor-pointer flex items-center gap-xs"
            [ngClass]="!selectedCategory() ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-surface-bone text-mute border-hairline hover:bg-surface-dark hover:text-canvas'">
            <span>All Categories</span>
            <span class="px-1.5 py-0.5 rounded-full text-caption-tight"
              [ngClass]="!selectedCategory() ? 'bg-surface-dark text-canvas' : 'bg-canvas text-charcoal'">
              {{ menuItems().length }}
            </span>
          </button>

          <button *ngFor="let cat of categories()"
            (click)="selectedCategory.set(cat.id)"
            class="px-md py-sm rounded-md text-caption-tight font-bold uppercase border transition-all whitespace-nowrap cursor-pointer flex items-center gap-xs"
            [ngClass]="selectedCategory() === cat.id ? 'bg-ink text-canvas border-ink shadow-sm' : 'bg-surface-bone text-mute border-hairline hover:bg-surface-dark hover:text-canvas'">
            <span>{{ cat.name }}</span>
            <span class="px-1.5 py-0.5 rounded-full text-caption-tight"
              [ngClass]="selectedCategory() === cat.id ? 'bg-surface-dark text-canvas' : 'bg-canvas text-charcoal'">
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </div>

        <!-- Catalog Grid -->
        <div class="flex-1 overflow-y-auto p-xl bg-canvas">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center h-64 text-mute">
            <div class="animate-spin rounded-full size-8 border-b-2 border-primary mb-md"></div>
            <p class="font-bold text-caption uppercase tracking-widest m-0">Loading Catalog Items...</p>
          </div>

          <!-- Empty Catalog -->
          <div *ngIf="!isLoading && filteredItems().length === 0" class="flex flex-col items-center justify-center h-64 text-center p-xl border border-hairline rounded-md bg-surface-bone">
            <div class="p-md rounded-full bg-canvas text-mute mb-md border border-hairline">
              <lucide-icon name="shopping-bag" class="size-8"></lucide-icon>
            </div>
            <h3 class="font-bold text-ink text-heading-sm m-0">No Dishes Match Your Filter</h3>
            <p class="text-body-sm text-mute mt-xs max-w-xs m-0">Try searching for a different keyword or select "All Categories" above.</p>
            <button *ngIf="selectedCategory() || searchQuery" (click)="resetFilters()" class="mt-md button-outline">
              Reset Filters
            </button>
          </div>

          <!-- Product Cards Grid -->
          <div *ngIf="!isLoading && filteredItems().length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-xl">
            <div *ngFor="let item of filteredItems()"
              (click)="addToCart(item)"
              class="bg-surface-bone border border-hairline rounded-md overflow-hidden cursor-pointer hover:border-[#333] transition-colors group flex flex-col justify-between relative"
              [ngClass]="{
                'opacity-50 grayscale pointer-events-none': !item.isAvailable,
                'ring-2 ring-primary': getItemCartQty(item.id) > 0
              }">
              
              <!-- Image Banner & Badges -->
              <div class="relative h-36 bg-surface-dark overflow-hidden">
                <img [src]="item.image || '/hero.png'" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-black/10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                <!-- Price Badge -->
                <div class="absolute top-sm left-sm bg-canvas/90 backdrop-blur-sm text-ink text-caption-tight font-bold px-sm py-xs rounded-md shadow-sm border border-hairline/50 flex items-center gap-0.5">
                  <span class="text-primary">${{ item.price | number:'1.2-2' }}</span>
                </div>

                <!-- Discount Pill -->
                <div *ngIf="item.discount > 0" class="absolute top-sm right-sm bg-[#e05d0e] text-canvas text-[10px] font-bold px-sm py-0.5 rounded-full shadow-sm">
                  -{{ calcDiscount(item) }}% OFF
                </div>

                <!-- Out of Stock Overlay -->
                <div *ngIf="!item.isAvailable" class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span class="bg-[#e02424] text-canvas text-caption font-bold px-md py-sm rounded-md uppercase tracking-wider shadow-md">
                    Out of Stock
                  </span>
                </div>

                <!-- Cart Qty Badge overlay -->
                <div *ngIf="getItemCartQty(item.id) > 0" class="absolute bottom-sm right-sm size-7 rounded-full bg-primary text-canvas font-bold text-caption flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                  {{ getItemCartQty(item.id) }}
                </div>
              </div>

              <!-- Item Content Info -->
              <div class="p-md flex flex-col justify-between flex-1">
                <div>
                  <h3 class="font-bold text-body-sm text-ink leading-tight m-0 group-hover:text-primary transition-colors line-clamp-1">{{ item.name }}</h3>
                  <p class="text-caption font-medium text-mute m-0 mt-xs line-clamp-1">
                    {{ item.category?.name || 'Artisanal Dish' }}
                  </p>
                </div>

                <div class="mt-md pt-sm border-t border-hairline flex items-center justify-between">
                  <span class="text-caption-tight font-bold uppercase tracking-wider text-mute group-hover:text-ink transition-colors">
                    Click to Add
                  </span>
                  <div class="size-6 rounded-md bg-canvas group-hover:bg-primary group-hover:text-canvas text-charcoal border border-hairline flex items-center justify-center transition-colors">
                    <lucide-icon name="plus" class="size-3.5"></lucide-icon>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Right Panel: Smart Order Cart & Terminal Checkout -->
      <div class="w-[380px] lg:w-[420px] flex flex-col bg-surface-bone rounded-md border border-hairline shadow-sm overflow-hidden shrink-0">
        
        <!-- Cart Header -->
        <div class="p-xl border-b border-hairline bg-canvas">
          <div class="flex items-center justify-between mb-md">
            <div class="flex items-center gap-sm">
              <lucide-icon name="shopping-bag" class="size-4.5 text-primary"></lucide-icon>
              <h2 class="font-bold text-ink uppercase tracking-wider text-body-sm m-0">Current Order Ticket</h2>
            </div>
            <span *ngIf="cart().length > 0" class="px-sm py-0.5 rounded-full bg-primary/10 text-primary font-bold text-caption-tight">
              {{ cartItemsCount() }} Items
            </span>
          </div>

          <!-- Segmented Order Type Control -->
          <div class="grid grid-cols-2 gap-sm bg-surface-bone p-xs rounded-md border border-hairline">
            <button (click)="orderType.set('DINE_IN')"
              class="py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-xs"
              [ngClass]="orderType() === 'DINE_IN' ? 'bg-canvas text-ink shadow-sm border border-hairline' : 'bg-transparent text-mute hover:text-ink'">
              <lucide-icon name="utensils" class="size-3.5"></lucide-icon>
              <span>Dine In</span>
            </button>

            <button (click)="orderType.set('TAKEAWAY')"
              class="py-sm rounded-md text-caption-tight font-bold uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-xs"
              [ngClass]="orderType() === 'TAKEAWAY' ? 'bg-canvas text-ink shadow-sm border border-hairline' : 'bg-transparent text-mute hover:text-ink'">
              <lucide-icon name="shopping-bag" class="size-3.5"></lucide-icon>
              <span>Take Away</span>
            </button>
          </div>

          <!-- Selected Table Banner (Only for Dine-In) -->
          <div *ngIf="orderType() === 'DINE_IN'" class="mt-md">
            <div *ngIf="selectedTable()" class="p-md rounded-md bg-canvas border border-hairline flex items-center justify-between">
              <div class="flex items-center gap-sm">
                <div class="size-7 rounded-md bg-ink text-canvas font-bold text-caption flex items-center justify-center">
                  {{ selectedTable()?.name?.charAt(0) || 'T' }}
                </div>
                <div>
                  <p class="text-caption-tight font-bold uppercase tracking-wider text-mute m-0">Assigned Table</p>
                  <p class="text-body-sm font-bold text-ink m-0 leading-tight">{{ selectedTable()?.name }} ({{ selectedTable()?.section }})</p>
                </div>
              </div>
              <button (click)="openTablePicker()" class="button-ghost p-xs text-caption-tight">
                Change
              </button>
            </div>

            <button *ngIf="!selectedTable()" (click)="openTablePicker()"
              class="w-full py-sm rounded-md bg-[#e05d0e]/10 hover:bg-[#e05d0e]/20 text-[#e05d0e] border border-[#e05d0e]/30 text-caption-tight font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-xs animate-pulse">
              <lucide-icon name="alert-circle" class="size-3.5"></lucide-icon>
              <span>+ Select Dining Table Required</span>
            </button>
          </div>
        </div>

        <!-- Cart Items Scroll Area -->
        <div class="flex-1 overflow-y-auto p-xl bg-surface-bone">
          <div *ngIf="cart().length === 0" class="flex flex-col items-center justify-center h-full text-center text-mute">
            <div class="size-14 rounded-full bg-canvas border border-hairline flex items-center justify-center mb-md text-charcoal">
              <lucide-icon name="shopping-bag" class="size-7"></lucide-icon>
            </div>
            <p class="font-bold text-body-sm text-ink m-0">Ticket is Empty</p>
            <p class="text-caption text-mute mt-xs max-w-[180px]">Click any dish from the catalog on the left to add it to this order.</p>
          </div>

          <div class="flex flex-col gap-md">
            <div *ngFor="let item of cart(); let i = index" class="p-sm bg-canvas rounded-md border border-hairline flex items-center gap-md group">
              <!-- Thumbnail -->
              <div class="size-12 rounded-md bg-cover bg-center border border-hairline shrink-0"
                [style.backgroundImage]="'url(' + (item.menuItem.image || '/hero.png') + ')'"></div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-bold text-body-sm text-ink m-0 truncate leading-tight">{{ item.menuItem.name }}</p>
                <p class="text-caption text-primary font-bold m-0 mt-0.5">${{ item.menuItem.price | number:'1.2-2' }} <span class="font-medium text-mute text-caption-tight">each</span></p>
              </div>

              <!-- Qty Controls -->
              <div class="flex items-center gap-xs bg-surface-bone p-0.5 rounded-md border border-hairline shrink-0">
                <button (click)="updateQty(i, -1)" class="size-6 rounded flex items-center justify-center border-none bg-transparent hover:bg-surface-dark text-charcoal cursor-pointer font-bold transition-colors">-</button>
                <span class="w-6 text-center text-caption font-bold text-ink">{{ item.quantity }}</span>
                <button (click)="updateQty(i, 1)" class="size-6 rounded flex items-center justify-center border-none bg-transparent hover:bg-surface-dark text-charcoal cursor-pointer font-bold transition-colors">+</button>
              </div>

              <!-- Remove Button -->
              <button (click)="removeFromCart(i)" title="Remove Item"
                class="size-7 rounded-md text-mute hover:bg-[#e02424]/10 hover:text-[#e02424] transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer shrink-0">
                <lucide-icon name="trash-2" class="size-3.5"></lucide-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Terminal Checkout Footer -->
        <div class="p-xl border-t border-hairline bg-canvas flex flex-col gap-xl">
          <!-- Breakdown -->
          <div class="space-y-sm text-caption">
            <div class="flex items-center justify-between text-charcoal">
              <span>Subtotal</span>
              <span class="font-bold text-ink">${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between text-charcoal">
              <span>Tax &amp; Service (Included)</span>
              <span class="font-bold text-ink">${{ (cartTotal() * 0.05) | number:'1.2-2' }}</span>
            </div>
            <div class="pt-sm border-t border-hairline flex items-center justify-between">
              <span class="text-body-sm font-bold uppercase tracking-wider text-ink">Total Due</span>
              <span class="text-heading-sm font-bold text-primary">${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Checkout Buttons -->
          <div class="flex flex-col gap-sm">
            <!-- Cash / Counter -->
            <button (click)="placeOrder('CASH')"
              [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
              class="w-full py-md button-outline flex items-center justify-center gap-xs">
              <lucide-icon name="dollar-sign" class="size-4"></lucide-icon>
              <span>{{ isSubmitting() ? 'Processing Ticket...' : 'Process Cash Order' }}</span>
            </button>

            <!-- Card / Stripe -->
            <button (click)="placeOrder('CARD')"
              [disabled]="cart().length === 0 || isSubmitting() || (orderType() === 'DINE_IN' && !selectedTable())"
              class="w-full py-md button-dark flex items-center justify-center gap-xs">
              <lucide-icon name="credit-card" class="size-4"></lucide-icon>
              <span>Pay Online via Card</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Table Picker Modal -->
      <div *ngIf="showTablePicker()" class="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-md animate-in fade-in duration-200">
        <div class="bg-canvas w-full max-w-xl rounded-md border border-hairline shadow-md overflow-hidden flex flex-col max-h-[80vh]">
          
          <div class="p-xl border-b border-hairline flex items-center justify-between bg-surface-bone">
            <div class="flex items-center gap-md">
              <div class="p-sm rounded-md bg-canvas border border-hairline text-ink">
                <lucide-icon name="layers" class="size-5"></lucide-icon>
              </div>
              <div>
                <h3 class="font-bold text-heading-sm text-ink m-0">Select an Available Table</h3>
                <p class="text-caption text-mute m-0 mt-xs">Choose an unoccupied table to assign to this Dine-In order</p>
              </div>
            </div>
            <button (click)="showTablePicker.set(false)" class="size-8 rounded-full bg-canvas text-mute hover:text-ink border border-hairline flex items-center justify-center cursor-pointer">
              <lucide-icon name="x" class="size-4.5"></lucide-icon>
            </button>
          </div>

          <div class="p-xl overflow-y-auto">
            <div *ngIf="availableTables().length === 0" class="py-xxl text-center text-mute">
              <p class="font-bold text-body-sm text-ink m-0">No Tables Available</p>
              <p class="text-caption text-mute mt-xs">All dining tables are currently occupied or reserved. Try switching to Take Away or clear a table first.</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-md">
              <button *ngFor="let table of availableTables()"
                (click)="selectTable(table)"
                class="p-lg rounded-md border border-hairline hover:border-[#333] bg-canvas transition-all cursor-pointer flex flex-col items-center justify-center gap-sm group relative">
                
                <div class="size-12 rounded-full bg-surface-bone border border-hairline text-ink font-bold text-body-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {{ table.name }}
                </div>
                
                <div class="text-center">
                  <p class="font-bold text-body-sm text-ink m-0">{{ table.name }}</p>
                  <p class="text-caption font-medium text-mute m-0 mt-0.5">{{ table.section }} • {{ table.seats }} Seats</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Mock Checkout Modal -->
      <app-mock-checkout *ngIf="showCheckout()"
        [amount]="cartTotal()" [orderId]="currentOrderId()"
        (success)="onPaymentSuccess()" (cancel)="showCheckout.set(false)">
      </app-mock-checkout>

    </div>
  `
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
  private searchSubject = new Subject<string>();

  // Icons
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly CreditCard = CreditCard;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly X = X;
  readonly ShoppingBag = ShoppingBag;
  readonly Utensils = Utensils;
  readonly DollarSign = DollarSign;
  readonly Check = Check;
  readonly AlertCircle = AlertCircle;
  readonly Sparkles = Sparkles;
  readonly Layers = Layers;
  readonly Coffee = Coffee;
  readonly ArrowRight = ArrowRight;

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private tableService: TableService
  ) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(q => this.loadMenu(q));
  }

  ngOnInit() {
    this.loadMenu();
    this.menuService.getCategories().subscribe({
      next: (c) => this.categories.set(c || [])
    });
    this.tableService.getTables().subscribe({
      next: (t) => this.tables.set(t || [])
    });
  }

  loadMenu(search = '') {
    this.isLoading = true;
    this.menuService.getMenuItems(1, 100, undefined, search || undefined).subscribe({
      next: (res) => {
        this.menuItems.set(res.data || []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(q: string) { this.searchSubject.next(q); }

  clearSearch() {
    this.searchQuery = '';
    this.loadMenu();
  }

  resetFilters() {
    this.selectedCategory.set(null);
    this.searchQuery = '';
    this.loadMenu();
  }

  getCategoryCount(catId: string): number {
    return this.menuItems().filter(i => i.categoryId === catId || i.category?.id === catId).length;
  }

  getItemCartQty(itemId: string): number {
    const item = this.cart().find(c => c.menuItem.id === itemId);
    return item ? item.quantity : 0;
  }

  filteredItems(): MenuItem[] {
    const cat = this.selectedCategory();
    let items = this.menuItems();
    if (cat) items = items.filter(i => i.categoryId === cat || i.category?.id === cat);
    return items;
  }

  availableTables(): Table[] {
    return this.tables().filter(t => t.status === TableStatus.AVAILABLE);
  }

  cartItemsCount = computed(() => this.cart().reduce((acc, idx) => acc + idx.quantity, 0));

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
    if (!item.discount || !item.price) return 0;
    return Math.round((item.discount / (item.price + item.discount)) * 100);
  }

  openTablePicker() {
    this.tableService.getTables().subscribe(t => this.tables.set(t || []));
    this.showTablePicker.set(true);
  }

  selectTable(table: Table) {
    this.selectedTable.set(table);
    this.showTablePicker.set(false);
  }

  placeOrder(method: 'CASH' | 'CARD') {
    if (!this.cart().length) return;
    if (this.orderType() === 'DINE_IN' && !this.selectedTable()) {
      alert('Please assign a dining table for this Dine-In order.');
      return;
    }
    this.isSubmitting.set(true);
    this.orderService.createOrder({
      orderType: this.orderType() === 'DINE_IN' ? OrderType.DINE_IN : OrderType.TAKEAWAY,
      tableId: this.selectedTable()?.id,
      paymentMethod: method === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH,
      items: this.cart().map(c => ({menuItemId: c.menuItem.id, quantity: c.quantity}))
    }).subscribe({
      next: (order) => {
        this.isSubmitting.set(false);
        if (method === 'CARD') {
          this.currentOrderId.set(order.id);
          this.showCheckout.set(true);
        } else {
          this.cart.set([]);
          this.selectedTable.set(null);
          alert('Ticket Created & Sent to Kitchen KDS Successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Failed to submit order ticket.');
      }
    });
  }

  onPaymentSuccess() {
    this.showCheckout.set(false);
    this.cart.set([]);
    this.selectedTable.set(null);
  }
}

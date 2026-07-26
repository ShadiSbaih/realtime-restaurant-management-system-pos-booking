import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../core/services/table.service';
import { Table, TableStatus, TableShape } from '../../core/models/table.model';
import { MenuService } from '../../core/services/menu.service';
import { MenuItem, Category } from '../../core/models/menu.model';
import { OrderService } from '../../core/services/order.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { OrderType, PaymentMethod } from '../../core/models/order.model';
import { FormsModule } from '@angular/forms';
import { MockCheckoutComponent } from '../payment/mock-checkout.component';
import { LucideAngularModule, Trash, Grid2x2 } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, MockCheckoutComponent, LucideAngularModule],
  template: `
    <div class="h-full flex flex-col bg-background">
      <!-- Top Header -->
      <header class="border-b sticky w-full top-0 z-10 bg-card/80 backdrop-blur">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex gap-2">
            <h1 class="text-2xl font-bold text-foreground m-0">
              Floor Plan Management
            </h1>
          </div>
          <!-- Waiter controls / Order status could go here -->
        </div>
      </header>
      
      <!-- Main Content Area -->
      <div class="flex flex-col h-[calc(100vh-80px)] overflow-hidden p-4">
        
        <!-- Floor Plan Card -->
        <div class="flex-1 dark:bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col relative overflow-hidden">
          
          <!-- POS Layout split: Left (Tables) / Right (Menu + Cart if selected) -->
          <div class="flex h-full gap-6">
            
            <!-- Tables Section -->
            <div class="flex-1 flex flex-col border-r border-border pr-6">
              <!-- Tabs -->
              <div class="w-full mb-8 border-b border-border flex gap-8">
                <button *ngFor="let tab of tabs" 
                        (click)="activeSection.set(tab)"
                        class="pb-4 font-medium text-sm relative transition-colors hover:text-primary"
                        [class.text-primary]="activeSection() === tab"
                        [class.text-muted-foreground]="activeSection() !== tab">
                  {{ tab }}
                  <div *ngIf="activeSection() === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                </button>
              </div>
              
              <!-- Legend -->
              <div class="flex gap-4 items-center mb-6 text-sm text-muted-foreground">
                <div class="flex items-center gap-1.5"><div class="bg-primary rounded-full w-4 h-4"></div> Available</div>
                <div class="flex items-center gap-1.5"><div class="bg-orange-500 rounded-full w-4 h-4"></div> Occupied</div>
                <div class="flex items-center gap-1.5"><div class="bg-blue-500 rounded-full w-4 h-4"></div> Reserved</div>
              </div>
              
              <!-- Grid Area -->
              <div class="flex-1 overflow-auto flex justify-center items-start pt-4">
                <div class="flex flex-wrap gap-8 justify-center max-w-[800px]">
                  <div *ngIf="displayTables().length === 0" class="text-muted-foreground">No tables available in this section.</div>
                  
                  <div *ngFor="let table of displayTables()"
                       (click)="selectTable(table)"
                       class="relative p-2 rounded-lg hover:border hover:border-primary group cursor-pointer transition-all duration-200"
                       [class.opacity-50]="isLoading()">
                    
                    <!-- Delete Button for Admin/Manager -->
                    <button *ngIf="canEdit"
                            (click)="deleteTable($event, table)"
                            class="absolute -top-4 -right-2 hidden group-hover:flex items-center justify-center rounded-full size-8 shadow-md z-20 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            [disabled]="table.status !== 'AVAILABLE'">
                      <lucide-icon name="trash" [size]="14"></lucide-icon>
                    </button>
                    
                    <!-- Table Shape -->
                    <div class="flex items-center justify-center flex-col transition-all duration-300 shadow-sm border-2"
                         [ngClass]="{
                           'rounded-lg aspect-square size-24': table.shape === 'square',
                           'rounded-full aspect-square size-24': table.shape === 'circle',
                           'rounded-lg aspect-[1.5] w-32 h-20': table.shape === 'rectangle',
                           'bg-primary/20 border-primary': table.status === 'AVAILABLE' && !isReserved(table),
                           'bg-orange-500/20 border-orange-500': table.status === 'OCCUPIED',
                           'bg-blue-500/20 border-blue-500': table.status === 'RESERVED' || isReserved(table),
                           'ring-2 ring-ring ring-offset-2 ring-offset-background': selectedTable()?.id === table.id
                         }">
                      <span class="font-bold text-foreground text-lg">{{ table.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ table.seats }} Seats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Menu & Cart Section (Right Side) -->
            <div class="w-[380px] flex flex-col h-full bg-background/50 rounded-xl border border-border overflow-hidden">
              <div *ngIf="!selectedTable()" class="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <lucide-icon [img]="Grid2x2" [size]="48" class="mb-4 opacity-50"></lucide-icon>
                <h3 class="text-lg font-medium text-foreground mb-1">No Table Selected</h3>
                <p class="text-sm">Select an available table from the floor plan to start an order.</p>
              </div>
              
              <ng-container *ngIf="selectedTable()">
                <div class="p-4 border-b border-border bg-card/50 flex justify-between items-center">
                  <div>
                    <h3 class="font-bold text-lg m-0 text-foreground">Order for {{ selectedTable()?.name }}</h3>
                    <span class="text-xs text-muted-foreground">New Order</span>
                  </div>
                  <button class="text-xs text-primary hover:underline" (click)="selectedTable.set(null)">Change</button>
                </div>
                
                <!-- Menu Categories (Horizontal Scroll) -->
                <div class="flex gap-2 p-3 overflow-x-auto border-b border-border hide-scrollbar shrink-0">
                   <button class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                           [class.bg-primary]="!selectedCategory()"
                           [class.text-primary-foreground]="!selectedCategory()"
                           [class.bg-secondary]="selectedCategory()"
                           [class.text-secondary-foreground]="selectedCategory()"
                           (click)="selectedCategory.set(null)">All</button>
                   <button *ngFor="let cat of categories()"
                           class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                           [class.bg-primary]="selectedCategory() === cat.id"
                           [class.text-primary-foreground]="selectedCategory() === cat.id"
                           [class.bg-secondary]="selectedCategory() !== cat.id"
                           [class.text-secondary-foreground]="selectedCategory() !== cat.id"
                           (click)="selectedCategory.set(cat.id)">{{ cat.name }}</button>
                </div>
                
                <!-- Menu Items Grid -->
                <div class="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
                  <div *ngFor="let item of filteredMenu()" 
                       (click)="addToCart(item)"
                       class="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors group flex flex-col">
                    <div class="h-24 bg-muted w-full bg-cover bg-center" [style.backgroundImage]="'url(' + (item.image || 'assets/placeholder.png') + ')'"></div>
                    <div class="p-2 flex-1 flex flex-col justify-between">
                      <span class="font-medium text-sm text-foreground leading-tight mb-1">{{ item.name }}</span>
                      <span class="text-primary font-bold text-sm">\${{ item.price | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Cart Footer -->
                <div class="border-t border-border bg-card p-4 shrink-0">
                  <div class="flex flex-col gap-2 mb-4 max-h-[150px] overflow-y-auto pr-1">
                    <div *ngIf="cart().length === 0" class="text-center text-muted-foreground text-sm py-2">Cart is empty</div>
                    <div *ngFor="let item of cart(); let i = index" class="flex justify-between items-center text-sm">
                      <div class="flex flex-col">
                        <span class="font-medium text-foreground truncate w-[140px]">{{ item.menuItem.name }}</span>
                        <span class="text-muted-foreground">\${{ item.menuItem.price }}</span>
                      </div>
                      <div class="flex items-center gap-2 bg-secondary rounded-md p-0.5">
                        <button class="size-6 flex items-center justify-center rounded text-foreground hover:bg-background" (click)="updateQuantity(i, -1)">-</button>
                        <span class="w-4 text-center font-medium">{{ item.quantity }}</span>
                        <button class="size-6 flex items-center justify-center rounded text-foreground hover:bg-background" (click)="updateQuantity(i, 1)">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center mb-4 font-bold text-lg text-foreground">
                    <span>Total:</span>
                    <span>\${{ cartTotal() | number:'1.2-2' }}</span>
                  </div>
                  
                  <div class="flex gap-2">
                    <button class="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
                            [disabled]="cart().length === 0 || isLoading()"
                            (click)="submitOrder('CASH')">
                      Pay Cash
                    </button>
                    <button class="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            [disabled]="cart().length === 0 || isLoading()"
                            (click)="submitOrder('CARD')">
                      Pay Card
                    </button>
                  </div>
                </div>
                
              </ng-container>
            </div>
            
          </div>
        </div>
      </div>
      
      <!-- Mock Checkout Overlay -->
      <app-mock-checkout *ngIf="showCheckout()" 
                         [amount]="cartTotal()" 
                         [orderId]="currentOrderId()"
                         (success)="onPaymentSuccess()"
                         (cancel)="onPaymentCancel()">
      </app-mock-checkout>
    </div>
  `,
  styles: []
})
export class PosComponent implements OnInit {
  tabs = ['Main Dining Room', 'Outdoor', 'Terrace'];
  activeSection = signal<string>('Main Dining Room');
  
  tables = signal<Table[]>([]);
  menuItems = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  
  selectedTable = signal<Table | null>(null);
  selectedCategory = signal<string | null>(null);
  
  cart = signal<{menuItem: MenuItem, quantity: number}[]>([]);
  isLoading = signal(false);
  
  showCheckout = signal(false);
  currentOrderId = signal<string>('');
  
  readonly Trash = Trash;
  readonly Grid2x2 = Grid2x2;
  canEdit = false;

  constructor(
    private tableService: TableService,
    private menuService: MenuService,
    private orderService: OrderService,
    private wsService: WebsocketService,
    private authService: AuthService
  ) {
    this.canEdit = this.authService.hasRole(['ADMIN', 'MANAGER'] as any);
    
    // Real-time table updates
    effect(() => {
      const update = this.wsService.tableUpdateEvent();
      if (update) {
        this.loadTables();
      }
    });
  }

  ngOnInit() {
    this.loadTables();
    this.loadCategories();
    this.loadMenu();
  }

  loadTables() {
    this.tableService.getTables().subscribe(data => this.tables.set(data));
  }

  loadCategories() {
    this.menuService.getCategories().subscribe(data => this.categories.set(data));
  }

  loadMenu() {
    this.menuService.getMenuItems(1, 100).subscribe(res => {
      this.menuItems.set(res.data);
    });
  }
  
  isReserved(table: Table): boolean {
    return table.reservations !== undefined && table.reservations.length > 0;
  }
  
  displayTables(): Table[] {
    return this.tables().filter(t => t.section === this.activeSection());
  }

  filteredMenu(): MenuItem[] {
    const catId = this.selectedCategory();
    if (!catId) return this.menuItems();
    return this.menuItems().filter(item => item.categoryId === catId || (item.category && item.category.id === catId));
  }

  selectTable(table: Table) {
    if (table.status !== TableStatus.AVAILABLE && this.selectedTable()?.id !== table.id) {
      alert('This table is not available!');
      return;
    }
    this.selectedTable.set(table);
  }

  deleteTable(event: Event, table: Table) {
    event.stopPropagation();
    if (table.status !== TableStatus.AVAILABLE) {
      alert('Cannot delete an occupied or reserved table.');
      return;
    }
    if (confirm(`Are you sure you want to delete table ${table.name}?`)) {
      this.tableService.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  addToCart(item: MenuItem) {
    if (!item.isAvailable) return;
    
    this.cart.update(current => {
      const existing = current.find(c => c.menuItem.id === item.id);
      if (existing) {
        return current.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...current, { menuItem: item, quantity: 1 }];
    });
  }

  updateQuantity(index: number, delta: number) {
    this.cart.update(current => {
      const updated = [...current];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  }

  cartTotal(): number {
    return this.cart().reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }

  submitOrder(method: 'CASH' | 'CARD') {
    if (this.cart().length === 0) return;
    
    const isDineIn = this.selectedTable() !== null;
    
    const request = {
      orderType: isDineIn ? OrderType.DINE_IN : OrderType.TAKEAWAY,
      tableId: this.selectedTable()?.id,
      paymentMethod: method === 'CARD' ? PaymentMethod.CARD : PaymentMethod.CASH,
      items: this.cart().map(c => ({
        menuItemId: c.menuItem.id,
        quantity: c.quantity
      }))
    };

    this.isLoading.set(true);
    this.orderService.createOrder(request).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        if (method === 'CARD') {
          this.currentOrderId.set(order.id);
          this.showCheckout.set(true);
        } else {
          this.cart.set([]);
          this.selectedTable.set(null);
          // Update table status locally for immediate feedback (websocket will sync it too)
          this.loadTables(); 
          alert('Cash Order placed successfully!');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'Error placing order');
      }
    });
  }
  
  onPaymentSuccess() {
    this.showCheckout.set(false);
    this.cart.set([]);
    this.selectedTable.set(null);
    this.loadTables();
  }
  
  onPaymentCancel() {
    this.showCheckout.set(false);
  }
}

import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../core/services/table.service';
import { Table, TableStatus, TableShape } from '../../core/models/table.model';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Plus, Trash2, X, Users, CheckCircle2, Clock, AlertCircle, Coffee, Sparkles, RefreshCw, Layers, Settings, Filter } from 'lucide-angular';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full gap-6 w-full">

      <!-- Header & Live Occupancy Banner -->
      <div class="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div class="flex items-center gap-3.5">
          <div class="p-3 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary border border-primary/20 shadow-inner">
            <lucide-icon name="layers" [size]="26"></lucide-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-black tracking-tight text-foreground m-0">Floor Plan &amp; Table Management</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 animate-pulse">
                Live Sync
              </span>
            </div>
            <p class="text-sm text-muted-foreground font-medium m-0 mt-1">Real-time dining room seating arrangement &amp; table status control</p>
          </div>
        </div>

        <!-- Header Action Controls -->
        <div class="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
          <button (click)="loadTables()" [disabled]="isLoading()"
            class="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border border-border shadow-sm">
            <lucide-icon name="refresh-cw" [size]="15" [class.animate-spin]="isLoading()"></lucide-icon>
            <span>Refresh Floor</span>
          </button>
          
          <button *ngIf="canEdit" (click)="openAddModal()"
            class="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-focus text-primary-foreground hover:opacity-95 px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-md hover:-translate-y-0.5 cursor-pointer border-none">
            <lucide-icon name="plus" [size]="18"></lucide-icon>
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      <!-- Live Analytics Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total Tables -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-muted-foreground m-0">Total Tables</p>
            <h3 class="text-3xl font-black text-foreground m-0 mt-1">{{ totalTablesCount() }}</h3>
            <p class="text-[11px] font-semibold text-muted-foreground m-0 mt-1 flex items-center gap-1">
              <lucide-icon name="users" [size]="12"></lucide-icon> {{ totalSeatsCount() }} Total Seating Capacity
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-500/10 text-slate-500 group-hover:scale-110 transition-transform">
            <lucide-icon name="layers" [size]="22"></lucide-icon>
          </div>
        </div>

        <!-- Available -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 m-0">Available</p>
            <h3 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 m-0 mt-1">{{ availableTablesCount() }}</h3>
            <p class="text-[11px] font-semibold text-muted-foreground m-0 mt-1">
              {{ getPercentage(availableTablesCount(), totalTablesCount()) }}% of room ready
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <lucide-icon name="check-circle-2" [size]="22"></lucide-icon>
          </div>
        </div>

        <!-- Occupied -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 m-0">Occupied</p>
            <h3 class="text-3xl font-black text-orange-600 dark:text-orange-400 m-0 mt-1">{{ occupiedTablesCount() }}</h3>
            <p class="text-[11px] font-semibold text-muted-foreground m-0 mt-1">
              {{ getPercentage(occupiedTablesCount(), totalTablesCount()) }}% currently seated
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
            <lucide-icon name="coffee" [size]="22"></lucide-icon>
          </div>
        </div>

        <!-- Reserved -->
        <div class="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 m-0">Reserved</p>
            <h3 class="text-3xl font-black text-blue-600 dark:text-blue-400 m-0 mt-1">{{ reservedTablesCount() }}</h3>
            <p class="text-[11px] font-semibold text-muted-foreground m-0 mt-1">
              Upcoming bookings
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <lucide-icon name="clock" [size]="22"></lucide-icon>
          </div>
        </div>
      </div>

      <!-- Navigation & Status Filters Bar -->
      <div class="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        <!-- Dining Section Tabs -->
        <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button *ngFor="let tab of sections"
            (click)="activeSection.set(tab)"
            class="px-4 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0"
            [ngClass]="activeSection() === tab ? 'bg-primary text-primary-foreground border-primary shadow-md font-black' : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'">
            <span>{{ tab }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs"
              [ngClass]="activeSection() === tab ? 'bg-white/20' : 'bg-muted/80 text-foreground'">
              {{ getSectionCount(tab) }}
            </span>
          </button>
        </div>

        <!-- Status Filter Pills -->
        <div class="flex items-center gap-1.5 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
          <span class="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
            <lucide-icon name="filter" [size]="13"></lucide-icon> Filter Status:
          </span>
          <button *ngFor="let filter of statusFilters"
            (click)="statusFilter.set(filter.value)"
            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap"
            [ngClass]="statusFilter() === filter.value ? 'bg-foreground text-background border-foreground shadow-sm' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'">
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && displayTables().length === 0" class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card/40">
        <div class="bg-muted p-5 rounded-full shadow-inner mb-4 text-muted-foreground">
          <lucide-icon name="layers" [size]="40"></lucide-icon>
        </div>
        <h3 class="text-xl font-black text-foreground mb-1">No Tables Found in Section</h3>
        <p class="text-sm text-muted-foreground max-w-sm mb-6">There are no tables in "{{ activeSection() }}" matching your current status filter.</p>
        <div class="flex gap-3">
          <button *ngIf="statusFilter() !== 'ALL'" (click)="statusFilter.set('ALL')"
            class="px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-xl text-xs font-bold transition-colors border border-border cursor-pointer">
            Show All Statuses
          </button>
          <button *ngIf="canEdit" (click)="openAddModal()"
            class="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-black transition-all border-none cursor-pointer shadow-sm">
            + Add Table Here
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p class="font-bold text-sm">Synchronizing Floor Plan &amp; Tables...</p>
      </div>

      <!-- Interactive Table Grid -->
      <div *ngIf="!isLoading() && displayTables().length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div *ngFor="let table of displayTables()"
          class="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden group"
          [ngClass]="getTableCardBorderClass(table.status)">

          <!-- Top Badge & Delete Icon -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <!-- Pulsing Dot -->
              <span class="size-2.5 rounded-full"
                [ngClass]="{
                  'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50': table.status === 'AVAILABLE',
                  'bg-orange-500 animate-pulse shadow-sm shadow-orange-500/50': table.status === 'OCCUPIED',
                  'bg-blue-500 shadow-sm shadow-blue-500/50': table.status === 'RESERVED'
                }"></span>
              <span class="text-[11px] font-black uppercase tracking-wider"
                [ngClass]="{
                  'text-emerald-600 dark:text-emerald-400': table.status === 'AVAILABLE',
                  'text-orange-600 dark:text-orange-400': table.status === 'OCCUPIED',
                  'text-blue-600 dark:text-blue-400': table.status === 'RESERVED'
                }">
                {{ table.status }}
              </span>
            </div>

            <!-- Delete Button (Admin Only, Available tables) -->
            <button *ngIf="canEdit && table.status === 'AVAILABLE'"
              (click)="deleteTable($event, table)"
              title="Delete Table"
              class="size-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm">
              <lucide-icon name="trash-2" [size]="13"></lucide-icon>
            </button>
          </div>

          <!-- Table Shape Visual Representation -->
          <div class="py-6 flex flex-col items-center justify-center cursor-pointer select-none relative group/table"
            (click)="toggleTableStatus(table)">
            
            <!-- Shape Box -->
            <div class="flex flex-col items-center justify-center font-black transition-all duration-300 shadow-inner relative"
              [ngClass]="{
                'rounded-full size-28 border-4': table.shape === 'circle',
                'rounded-2xl size-28 border-4': table.shape === 'square',
                'rounded-2xl w-36 h-24 border-4': table.shape === 'rectangle',
                'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 group-hover/table:border-emerald-500 group-hover/table:shadow-emerald-500/20 group-hover/table:scale-105': table.status === 'AVAILABLE',
                'bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300 group-hover/table:border-orange-500 group-hover/table:shadow-orange-500/20 group-hover/table:scale-105': table.status === 'OCCUPIED',
                'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 group-hover/table:border-blue-500 group-hover/table:shadow-blue-500/20 group-hover/table:scale-105': table.status === 'RESERVED'
              }">
              
              <!-- VIP badge for Circle -->
              <div *ngIf="table.shape === 'circle'" class="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                <lucide-icon name="sparkles" [size]="9"></lucide-icon> VIP
              </div>

              <span class="text-lg font-black tracking-tight">{{ table.name }}</span>
              <span class="text-[11px] font-bold opacity-75 capitalize mt-0.5">{{ table.shape }}</span>
            </div>

            <!-- Hint overlay on hover -->
            <div *ngIf="canEdit" class="absolute -bottom-2 opacity-0 group-hover/table:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-black px-2.5 py-1 rounded-full shadow-md pointer-events-none whitespace-nowrap">
              Click to Toggle Status
            </div>
          </div>

          <!-- Footer Information & Quick Action -->
          <div class="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
            <!-- Seat Count -->
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-bold">
              <lucide-icon name="users" [size]="13"></lucide-icon>
              <span>{{ table.seats }} Seats</span>
            </div>

            <!-- State Button -->
            <button *ngIf="canEdit && table.status === 'AVAILABLE'" (click)="quickSetStatus(table, 'OCCUPIED')"
              class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-black transition-all border border-emerald-500/20 cursor-pointer">
              Seat Guests
            </button>
            
            <button *ngIf="canEdit && table.status === 'OCCUPIED'" (click)="quickSetStatus(table, 'AVAILABLE')"
              class="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-600 dark:text-orange-400 text-xs font-black transition-all border border-orange-500/20 cursor-pointer">
              Clear Table
            </button>

            <button *ngIf="canEdit && table.status === 'RESERVED'" (click)="quickSetStatus(table, 'OCCUPIED')"
              class="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-black transition-all border border-blue-500/20 cursor-pointer">
              Check-In
            </button>
          </div>

        </div>
      </div>

      <!-- Add New Table Modal (Glassmorphic & Rich UI) -->
      <div *ngIf="showAddModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
          
          <!-- Modal Header -->
          <div class="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                <lucide-icon name="plus" [size]="20"></lucide-icon>
              </div>
              <div>
                <h3 class="font-black text-lg text-foreground m-0">Add New Dining Table</h3>
                <p class="text-xs text-muted-foreground m-0 mt-0.5">Configure seating capacity, section &amp; table layout shape</p>
              </div>
            </div>
            <button (click)="closeAddModal()" class="size-8 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border-none flex items-center justify-center cursor-pointer">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-5">
            <!-- Table Preview Box -->
            <div class="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-center gap-6">
              <div class="text-center">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Live Table Preview</p>
                <div class="flex items-center justify-center font-black bg-primary/20 border-2 border-primary text-foreground shadow-sm mx-auto transition-all duration-300"
                  [ngClass]="{
                    'rounded-full size-20': newTable.shape === 'circle',
                    'rounded-xl size-20': newTable.shape === 'square',
                    'rounded-xl w-28 h-20': newTable.shape === 'rectangle'
                  }">
                  <div class="text-center">
                    <div *ngIf="newTable.shape === 'circle'" class="text-[9px] font-black text-primary mb-0.5">VIP</div>
                    <div class="font-black text-sm">{{ newTable.name || 'T-01' }}</div>
                  </div>
                </div>
              </div>
              <div class="text-left text-xs space-y-1 text-muted-foreground">
                <p class="m-0"><strong class="text-foreground">Section:</strong> {{ newTable.section }}</p>
                <p class="m-0"><strong class="text-foreground">Capacity:</strong> {{ newTable.seats }} Guests</p>
                <p class="m-0 capitalize"><strong class="text-foreground">Shape:</strong> {{ newTable.shape }} Table</p>
              </div>
            </div>

            <!-- Form Inputs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Table Name -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-foreground">Table Identifier / Name</label>
                <input type="text" [(ngModel)]="newTable.name" placeholder="e.g. Table 12, VIP Lounge 1"
                  class="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <!-- Seats Count -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-foreground">Seating Capacity (Guests)</label>
                <input type="number" [(ngModel)]="newTable.seats" min="1" max="30"
                  class="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <!-- Dining Section -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-foreground">Dining Section</label>
                <select [(ngModel)]="newTable.section"
                  class="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option *ngFor="let s of sections" [value]="s">{{ s }}</option>
                </select>
              </div>

              <!-- Table Shape -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-foreground">Table Shape &amp; Style</label>
                <select [(ngModel)]="newTable.shape"
                  class="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="square">Square (Standard 2-4 Seats)</option>
                  <option value="circle">Round (VIP / Family Banquet)</option>
                  <option value="rectangle">Rectangle (Large Group / Booth)</option>
                </select>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 pt-4 border-t border-border mt-1">
              <button (click)="closeAddModal()"
                class="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-muted transition-colors bg-transparent cursor-pointer">
                Cancel
              </button>
              <button (click)="addTable()" [disabled]="isAdding() || !newTable.name"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-focus text-primary-foreground text-sm font-black hover:opacity-95 transition-all border-none cursor-pointer disabled:opacity-50 shadow-md">
                {{ isAdding() ? 'Creating Table...' : 'Create Dining Table' }}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
})
export class TablesComponent implements OnInit {
  sections = ['Main Dining Room', 'Outdoor', 'Terrace'];
  activeSection = signal('Main Dining Room');
  statusFilter = signal<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'>('ALL');
  tables = signal<Table[]>([]);
  showAddModal = signal(false);
  isAdding = signal(false);
  isLoading = signal(false);
  canEdit = false;

  statusFilters: { label: string; value: 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Available Only', value: 'AVAILABLE' },
    { label: 'Occupied Only', value: 'OCCUPIED' },
    { label: 'Reserved Only', value: 'RESERVED' }
  ];

  newTable = { name: '', seats: 4, section: 'Main Dining Room', shape: 'square' };

  // Icons
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Users = Users;
  readonly CheckCircle2 = CheckCircle2;
  readonly Clock = Clock;
  readonly AlertCircle = AlertCircle;
  readonly Coffee = Coffee;
  readonly Sparkles = Sparkles;
  readonly RefreshCw = RefreshCw;
  readonly Layers = Layers;
  readonly Settings = Settings;
  readonly Filter = Filter;

  constructor(
    private tableService: TableService,
    private wsService: WebsocketService,
    private authService: AuthService
  ) {
    this.canEdit = this.authService.hasRole(['ADMIN', 'MANAGER'] as any);
    effect(() => {
      if (this.wsService.tableUpdateEvent()) this.loadTables();
    });
  }

  ngOnInit() { this.loadTables(); }

  loadTables() {
    this.isLoading.set(true);
    this.tableService.getTables().subscribe({
      next: (data) => {
        this.tables.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  totalTablesCount = computed(() => this.tables().length);
  totalSeatsCount = computed(() => this.tables().reduce((acc, t) => acc + (t.seats || 0), 0));
  availableTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.AVAILABLE).length);
  occupiedTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.OCCUPIED).length);
  reservedTablesCount = computed(() => this.tables().filter(t => t.status === TableStatus.RESERVED).length);

  getSectionCount(section: string): number {
    return this.tables().filter(t => t.section === section).length;
  }

  getPercentage(part: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  displayTables(): Table[] {
    let list = this.tables().filter(t => t.section === this.activeSection());
    const sf = this.statusFilter();
    if (sf !== 'ALL') {
      list = list.filter(t => t.status === sf);
    }
    return list;
  }

  toggleTableStatus(table: Table) {
    if (!this.canEdit) return;
    let nextStatus = TableStatus.AVAILABLE;
    if (table.status === TableStatus.AVAILABLE) nextStatus = TableStatus.OCCUPIED;
    else if (table.status === TableStatus.OCCUPIED) nextStatus = TableStatus.RESERVED;
    else nextStatus = TableStatus.AVAILABLE;

    this.tableService.updateTableStatus(table.id, nextStatus).subscribe(() => this.loadTables());
  }

  quickSetStatus(table: Table, statusStr: string) {
    if (!this.canEdit) return;
    const nextStatus = statusStr as TableStatus;
    this.tableService.updateTableStatus(table.id, nextStatus).subscribe(() => this.loadTables());
  }

  deleteTable(event: Event, table: Table) {
    event.stopPropagation();
    if (table.status !== TableStatus.AVAILABLE) {
      alert('Cannot delete an occupied or reserved table. Please clear it first.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete table "${table.name}"?`)) {
      this.tableService.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  openAddModal() {
    this.newTable = { name: '', seats: 4, section: this.activeSection() || 'Main Dining Room', shape: 'square' };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addTable() {
    if (!this.newTable.name) return;
    this.isAdding.set(true);
    this.tableService.createTable({
      name: this.newTable.name.trim(),
      seats: Number(this.newTable.seats) || 4,
      section: this.newTable.section,
      shape: this.newTable.shape as TableShape
    }).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.showAddModal.set(false);
        this.newTable = { name: '', seats: 4, section: 'Main Dining Room', shape: 'square' };
        this.loadTables();
      },
      error: () => {
        this.isAdding.set(false);
        alert('Failed to add dining table. Please try again.');
      }
    });
  }

  getTableCardBorderClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'border-t-4 border-t-emerald-500';
      case 'OCCUPIED': return 'border-t-4 border-t-orange-500';
      case 'RESERVED': return 'border-t-4 border-t-blue-500';
      default: return 'border-t-border';
    }
  }
}

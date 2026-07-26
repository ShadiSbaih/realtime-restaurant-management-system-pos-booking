import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, Role } from '../../core/models/user.model';
import { LucideAngularModule, Users, UserCheck, Shield, Ban, Download, User as UserIcon, MoreHorizontal, Trash2, Mail, Filter, FileDown } from 'lucide-angular';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full h-full">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-foreground m-0">User Management</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage staff and customer accounts.</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 border border-border bg-card hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
            <lucide-icon name="download" [size]="15"></lucide-icon> + Bulk Import
          </button>
          <button class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-bold transition-colors border-none cursor-pointer shadow-md">
            <lucide-icon name="mail" [size]="15"></lucide-icon> BROADCAST EMAIL
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
          <p class="text-sm text-muted-foreground font-medium m-0">Total Users</p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-black text-foreground m-0">{{ totalUsers() }}</h3>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">+12%</span>
          </div>
        </div>
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
          <p class="text-sm text-muted-foreground font-medium m-0">Active Staff</p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-black text-foreground m-0">{{ activeStaff() }}</h3>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">+3%</span>
          </div>
        </div>
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
          <p class="text-sm text-muted-foreground font-medium m-0">Super Admins</p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-black text-foreground m-0">{{ adminCount() }}</h3>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Stable</span>
          </div>
        </div>
        <div class="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
          <p class="text-sm text-muted-foreground font-medium m-0">Banned Users</p>
          <div class="flex items-end justify-between">
            <h3 class="text-3xl font-black text-foreground m-0">{{ bannedCount() }}</h3>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">-2%</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div class="relative flex-1 w-full">
          <lucide-icon name="users" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></lucide-icon>
          <input type="text" placeholder="Search users..."
            [(ngModel)]="searchQuery"
            class="w-full pl-9 h-9 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
        </div>
        <!-- Role pills -->
        <div class="flex items-center gap-1 flex-wrap">
          <button *ngFor="let r of roleFilters" (click)="selectedRole = r.value"
            class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer"
            [class.bg-primary]="selectedRole === r.value"
            [class.text-primary-foreground]="selectedRole === r.value"
            [class.border-primary]="selectedRole === r.value"
            [class.bg-transparent]="selectedRole !== r.value"
            [class.text-muted-foreground]="selectedRole !== r.value"
            [class.border-border]="selectedRole !== r.value">
            {{ r.label }}
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted bg-transparent cursor-pointer">
            <lucide-icon name="filter" [size]="13"></lucide-icon> Filter
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted bg-transparent cursor-pointer">
            <lucide-icon name="file-down" [size]="13"></lucide-icon> Export
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-card rounded-xl border border-border shadow-sm flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-sm text-left">
            <thead class="bg-muted/40 border-b border-border">
              <tr>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Permissions</th>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Send Mail</th>
                <th class="px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngIf="isLoading()">
                <td colspan="6" class="px-5 py-12 text-center text-muted-foreground text-sm">Loading users...</td>
              </tr>
              <tr *ngIf="!isLoading() && filteredUsers().length === 0">
                <td colspan="6" class="px-5 py-12 text-center text-muted-foreground text-sm">No users found.</td>
              </tr>
              <tr *ngFor="let user of filteredUsers()" class="hover:bg-muted/20 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-border">
                      <img *ngIf="user.avatar" [src]="user.avatar" class="size-full object-cover" />
                      <span *ngIf="!user.avatar" class="text-primary font-bold text-sm uppercase">{{ user.name?.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-foreground m-0 text-sm leading-tight">{{ user.name }}</p>
                      <p class="text-xs text-muted-foreground m-0">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span class="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider"
                    [ngClass]="getRoleBadge(user.role)">{{ user.role }}</span>
                </td>
                <td class="px-5 py-3">
                  <span class="px-2.5 py-1 rounded-md text-[11px] font-bold"
                    [class.bg-green-500\/10]="!user.banned" [class.text-green-500]="!user.banned"
                    [class.bg-red-500\/10]="user.banned" [class.text-red-500]="user.banned">
                    {{ user.banned ? 'Banned' : 'Active' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-muted-foreground font-medium">{{ getPermissions(user.role) }}</td>
                <td class="px-5 py-3">
                  <button class="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted bg-transparent cursor-pointer transition-colors">
                    <lucide-icon name="mail" [size]="12"></lucide-icon> SEND EMAIL
                  </button>
                </td>
                <td class="px-5 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button (click)="toggleBan(user)" [title]="user.banned ? 'Unban' : 'Ban'"
                      class="size-8 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="ban" [size]="14"></lucide-icon>
                    </button>
                    <button (click)="deleteUser(user.id)" title="Delete"
                      class="size-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                    </button>
                    <button class="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors">
                      <lucide-icon name="more-horizontal" [size]="14"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersAdminComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(true);

  roleFilters = [
    { label: 'All', value: 'ALL' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Staff', value: 'STAFF' },
    { label: 'Kitchen', value: 'KITCHEN' },
    { label: 'Customer', value: 'CUSTOMER' },
  ];

  _searchQuery = signal('');
  get searchQuery() { return this._searchQuery(); }
  set searchQuery(v: string) { this._searchQuery.set(v); }

  _selectedRole = signal<string>('ALL');
  get selectedRole() { return this._selectedRole(); }
  set selectedRole(v: string) { this._selectedRole.set(v); }

  constructor(private userService: UserService) {}

  ngOnInit() { this.fetchUsers(); }

  fetchUsers() {
    this.isLoading.set(true);
    this.userService.getUsers(1, 100).subscribe({
      next: (res) => { this.users.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  filteredUsers = computed(() => {
    let f = this.users();
    const q = this._searchQuery().toLowerCase();
    const r = this._selectedRole();
    if (q) f = f.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (r !== 'ALL') f = f.filter(u => u.role === r);
    return f;
  });

  totalUsers = computed(() => this.users().length);
  activeStaff = computed(() => this.users().filter(u => u.role !== Role.CUSTOMER && !u.banned).length);
  adminCount = computed(() => this.users().filter(u => u.role === Role.ADMIN).length);
  bannedCount = computed(() => this.users().filter(u => u.banned).length);

  toggleBan(user: User) {
    if (user.banned) {
      this.userService.unbanUser(user.id).subscribe(() => this.fetchUsers());
    } else {
      const reason = prompt('Reason for ban?', 'Admin action');
      if (reason !== null) this.userService.banUser(user.id, reason).subscribe(() => this.fetchUsers());
    }
  }

  deleteUser(id: string) {
    if (confirm('Delete this user permanently?')) {
      this.userService.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }

  getRoleBadge(role: Role): string {
    switch (role) {
      case Role.ADMIN:    return 'bg-purple-500/20 text-purple-400';
      case Role.MANAGER:  return 'bg-blue-500/20 text-blue-400';
      case Role.STAFF:    return 'bg-cyan-500/20 text-cyan-400';
      case Role.KITCHEN:  return 'bg-orange-500/20 text-orange-400';
      default:            return 'bg-slate-500/20 text-slate-400';
    }
  }

  getPermissions(role: Role): string {
    switch (role) {
      case Role.ADMIN:    return 'Full Access';
      case Role.MANAGER:  return 'Manage Menu & Staff';
      case Role.KITCHEN:  return 'View Orders, KDS';
      case Role.STAFF:    return 'Create Orders';
      default:            return 'View Menu';
    }
  }
}

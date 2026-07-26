import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, Role } from '../../core/models/user.model';
import { LucideAngularModule, Users, UserCheck, Shield, Ban, Download, User as UserIcon, MoreVertical, Trash2, Edit } from 'lucide-angular';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-6 w-full h-full">
      
      <!-- Header -->
      <div class="bg-card rounded-xl border border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
        <div>
          <h2 class="text-2xl font-bold text-foreground m-0 tracking-tight">User Management</h2>
          <p class="text-muted-foreground mt-1 text-sm">Manage staff and customer accounts.</p>
        </div>
        <button class="bg-background border border-border text-foreground hover:bg-muted px-4 py-2 rounded-md shadow-sm font-medium flex items-center gap-2 transition-colors">
          <lucide-icon [img]="Download" [size]="16"></lucide-icon> Bulk Import
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <lucide-icon [img]="UsersIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground m-0">Total Users</p>
            <div class="flex items-end gap-2 mt-1">
              <h3 class="text-2xl font-bold text-foreground m-0 leading-none">{{ totalUsers() }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
            <lucide-icon [img]="UserCheck" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground m-0">Active Staff</p>
            <div class="flex items-end gap-2 mt-1">
              <h3 class="text-2xl font-bold text-foreground m-0 leading-none">{{ activeStaff() }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <lucide-icon [img]="Shield" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground m-0">Super Admins</p>
            <div class="flex items-end gap-2 mt-1">
              <h3 class="text-2xl font-bold text-foreground m-0 leading-none">{{ adminCount() }}</h3>
            </div>
          </div>
        </div>

        <div class="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <lucide-icon [img]="Ban" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground m-0">Banned Users</p>
            <div class="flex items-end gap-2 mt-1">
              <h3 class="text-2xl font-bold text-foreground m-0 leading-none">{{ bannedCount() }}</h3>
            </div>
          </div>
        </div>

      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row gap-4 bg-card rounded-xl border border-border p-4 shadow-sm">
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          class="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          [(ngModel)]="searchQuery" 
        />
        <select 
          class="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          [(ngModel)]="selectedRole">
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
          <option value="KITCHEN">Kitchen</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-card rounded-xl border border-border shadow-sm flex-1 overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th class="px-6 py-4 font-semibold">User</th>
                <th class="px-6 py-4 font-semibold">Role</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold">Permissions</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngIf="isLoading()">
                <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                  Loading users...
                </td>
              </tr>
              <tr *ngIf="!isLoading() && filteredUsers().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                  No users found matching your criteria.
                </td>
              </tr>
              <tr *ngFor="let user of filteredUsers()" class="hover:bg-muted/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                      <lucide-icon *ngIf="!user.avatar" [img]="UserBasicIcon" [size]="20" class="text-muted-foreground"></lucide-icon>
                      <img *ngIf="user.avatar" [src]="user.avatar" class="size-full object-cover" />
                    </div>
                    <div class="flex flex-col">
                      <span class="font-semibold text-foreground">{{ user.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                        [ngClass]="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span *ngIf="user.banned" class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    Banned
                  </span>
                  <span *ngIf="!user.banned" class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-muted-foreground">
                  {{ getPermissionsText(user.role) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="text-muted-foreground hover:text-orange-600 transition-colors p-2" title="Toggle Ban" (click)="toggleBan(user)">
                      <lucide-icon [img]="Ban" [size]="16"></lucide-icon>
                    </button>
                    <button class="text-muted-foreground hover:text-destructive transition-colors p-2" title="Delete User" (click)="deleteUser(user.id)">
                      <lucide-icon [img]="Trash2" [size]="16"></lucide-icon>
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
  
  _searchQuery = signal('');
  get searchQuery() { return this._searchQuery(); }
  set searchQuery(val: string) { this._searchQuery.set(val); }

  _selectedRole = signal<Role | 'ALL'>('ALL');
  get selectedRole() { return this._selectedRole(); }
  set selectedRole(val: Role | 'ALL') { this._selectedRole.set(val); }

  // Icons
  readonly UsersIcon = Users;
  readonly UserCheck = UserCheck;
  readonly Shield = Shield;
  readonly Ban = Ban;
  readonly Download = Download;
  readonly UserBasicIcon = UserIcon;
  readonly MoreVertical = MoreVertical;
  readonly Trash2 = Trash2;
  readonly Edit = Edit;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading.set(true);
    // Fetch all for now to do client-side filtering, or adapt if needed
    this.userService.getUsers(1, 100).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Computed properties
  filteredUsers = computed(() => {
    let filtered = this.users();
    const query = this._searchQuery().toLowerCase();
    const role = this._selectedRole();

    if (query) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    }
    if (role !== 'ALL') {
      filtered = filtered.filter(u => u.role === role);
    }
    return filtered;
  });

  totalUsers = computed(() => this.users().length);
  activeStaff = computed(() => this.users().filter(u => u.role !== Role.CUSTOMER && !u.banned).length);
  adminCount = computed(() => this.users().filter(u => u.role === Role.ADMIN).length);
  bannedCount = computed(() => this.users().filter(u => u.banned).length);

  // Actions
  toggleBan(user: User) {
    if (user.banned) {
      this.userService.unbanUser(user.id).subscribe(() => this.fetchUsers());
    } else {
      const reason = prompt('Reason for ban?', 'Admin action');
      if (reason !== null) {
        this.userService.banUser(user.id, reason).subscribe(() => this.fetchUsers());
      }
    }
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to permanently delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => this.fetchUsers());
    }
  }

  // Helpers
  getRoleBadgeClass(role: Role): string {
    switch(role) {
      case Role.ADMIN: return 'bg-purple-500/10 text-purple-600 border border-purple-500/20';
      case Role.MANAGER: return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      case Role.STAFF: return 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20';
      case Role.KITCHEN: return 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  }

  getPermissionsText(role: Role): string {
    switch(role) {
      case Role.ADMIN: return 'Full Access';
      case Role.MANAGER: return 'Manage Menu & Staff';
      case Role.KITCHEN: return 'View Orders, KDS';
      case Role.STAFF: return 'Create Orders';
      default: return 'View Menu';
    }
  }
}

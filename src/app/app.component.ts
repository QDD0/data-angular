import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from './app.main.service';
import { User } from './user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  users: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  editingUser: User | null = null;
  editedUser: User | null = null;
  isLoading: boolean = false;
  sortColumn: keyof User | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private mainService: MainService) {}

  get displayedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.users.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }

  openFileDialog() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.users = [];
      this.currentPage = 1;
      this.editingUser = null;
      this.editedUser = null;
      this.isLoading = true;
      try {
        const newUsers = await this.mainService.handleFileSelection(Array.from(input.files));
        this.users = [...this.users, ...newUsers];
      } catch (error) {
        console.error('Ошибка при обработке файлов:', error);
      } finally {
        this.isLoading = false;
        input.value = '';
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.editedUser = { ...user };
  }

  saveUser() {
    if (this.editingUser && this.editedUser) {
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.editedUser };
        this.users = [...this.users];
      }
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingUser = null;
    this.editedUser = null;
  }

  sortBy(column: keyof User) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (column === 'id') {
        const numA = valueA != null ? Number(valueA) : 0;
        const numB = valueB != null ? Number(valueB) : 0;
        return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      } else if (column === 'data') {
        const dateA = isNaN(new Date(valueA).getTime()) ? 0 : new Date(valueA).getTime();
        const dateB = isNaN(new Date(valueB).getTime()) ? 0 : new Date(valueB).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const strA = valueA != null ? String(valueA).toLowerCase() : '';
        const strB = valueB != null ? String(valueB).toLowerCase() : '';
        return this.sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    this.users = [...this.users];
  }
}

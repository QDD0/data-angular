import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  status: string;
  data: string;
}

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.users = [];
      this.currentPage = 1;
      this.editingUser = null;
      this.editedUser = null;
      this.isLoading = true;
      const files = Array.from(input.files);
      Promise.all(files.map(file => this.readFile(file)))
        .then(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        })
        .catch(() => {
          this.isLoading = false;
        });
      input.value = '';
    }
  }

  readFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result as string);
          const normalizedData = Array.isArray(jsonData) ? jsonData : [jsonData];
          this.users = [
            ...this.users,
            ...normalizedData.map((item: any) => ({
              ...item,
              id: Number(item.id) || 0,
            })),
          ];
          resolve();
        } catch (error) {
          console.error('Ошибка при парсинге JSON:', error);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error('Ошибка при чтении файла');
        reject(new Error('File reading error'));
      };
      reader.readAsText(file);
    });
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
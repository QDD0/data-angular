// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';

// interface User {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   address: string;
//   status: string;
//   data: string;
// }

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   users: User[] = [];

//   openFileDialog() {
//     const fileInput = document.getElementById('fileInput') as HTMLInputElement;
//     if (fileInput) {
//       fileInput.click();
//     } else {
//       console.error('File input element not found');
//     }
//   }

//   onFileSelected(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.users = [];
//       Array.from(input.files).forEach((file) => this.readFile(file));
//     }
//   }

//   readFile(file: File) {
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const jsonData = JSON.parse(reader.result as string);
//         if (Array.isArray(jsonData)) {
//           this.users = [...this.users, ...jsonData];
//         } else {
//           this.users.push(jsonData);
//         }
//       } catch (error) {
//         console.error('Ошибка при парсинге JSON:', error);
//       }
//     };
//     reader.readAsText(file);
//   }
// }


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  users: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Вычисляем отображаемые пользователи для текущей страницы
  get displayedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.users.slice(startIndex, endIndex);
  }

  // Общее количество страниц
  get totalPages(): number {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }

  openFileDialog() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.users = [];
      this.currentPage = 1; // Сбрасываем на первую страницу при новой загрузке
      Array.from(input.files).forEach((file) => this.readFile(file));
    }
  }

  readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const jsonData = JSON.parse(reader.result as string);
        if (Array.isArray(jsonData)) {
          this.users = [...this.users, ...jsonData];
        } else {
          this.users.push(jsonData);
        }
      } catch (error) {
        console.error('Ошибка при парсинге JSON:', error);
      }
    };
    reader.readAsText(file);
  }

  // Перейти на следующую страницу
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Перейти на предыдущую страницу
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Перейти на конкретную страницу
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard">
      <nav class="sidebar">
        <h2>Agenda Inteligente</h2>
        <ul>
          <li><a routerLink="agenda" routerLinkActive="active">Agenda</a></li>
          <li><a routerLink="customers" routerLinkActive="active">Clientes</a></li>
          <li><a routerLink="services" routerLinkActive="active">Serviços</a></li>
          <li><a routerLink="appointments" routerLinkActive="active">Agendamentos</a></li>
        </ul>
        <button class="logout-btn" (click)="logout()">Trocar Negócio</button>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: #f8f9fa;
      padding: 20px;
      border-right: 1px solid #dee2e6;
    }
    .sidebar h2 {
      margin-bottom: 30px;
      color: #495057;
    }
    .sidebar ul {
      list-style: none;
      padding: 0;
    }
    .sidebar li {
      margin-bottom: 10px;
    }
    .sidebar a {
      display: block;
      padding: 10px 15px;
      text-decoration: none;
      color: #495057;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    .sidebar a:hover, .sidebar a.active {
      background: #007bff;
      color: white;
    }
    .logout-btn {
      margin-top: 30px;
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    .logout-btn:hover {
      background: #c82333;
    }
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class DashboardComponent {
  logout() {
    // Navigate back to tenant selection
    window.location.href = '/tenants';
  }
}

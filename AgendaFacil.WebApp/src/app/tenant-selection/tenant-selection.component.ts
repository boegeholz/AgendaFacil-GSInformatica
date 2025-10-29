import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Tenant } from '../api.service';

@Component({
  selector: 'app-tenant-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tenant-selection">
      <h1>Agenda Inteligente</h1>
      <p>Selecione seu negócio ou crie um novo</p>

      <div class="tenants-grid">
        <div *ngFor="let tenant of tenants" class="tenant-card" (click)="selectTenant(tenant)">
          <h3>{{ tenant.name }}</h3>
          <p>{{ tenant.description }}</p>
          <small>{{ tenant.phone }}</small>
        </div>
      </div>

      <div class="create-tenant">
        <h2>Criar Novo Negócio</h2>
        <form (ngSubmit)="createTenant()" #tenantForm="ngForm">
          <div class="form-group">
            <label for="name">Nome do Negócio:</label>
            <input type="text" id="name" [(ngModel)]="newTenant.name" name="name" required>
          </div>
          <div class="form-group">
            <label for="description">Descrição:</label>
            <textarea id="description" [(ngModel)]="newTenant.description" name="description"></textarea>
          </div>
          <div class="form-group">
            <label for="phone">Telefone:</label>
            <input type="tel" id="phone" [(ngModel)]="newTenant.phone" name="phone">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" [(ngModel)]="newTenant.email" name="email">
          </div>
          <button type="submit" [disabled]="!tenantForm.valid">Criar Negócio</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .tenant-selection {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .tenants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .tenant-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: box-shadow 0.3s;
    }
    .tenant-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .create-tenant {
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    textarea {
      height: 80px;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class TenantSelectionComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  tenants: Tenant[] = [];
  newTenant: Partial<Tenant> = {};

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.apiService.getTenants().subscribe({
      next: (tenants) => this.tenants = tenants,
      error: (error) => console.error('Error loading tenants:', error)
    });
  }

  selectTenant(tenant: Tenant) {
    this.apiService.setTenantId(tenant.id);
    this.router.navigate(['/dashboard']);
  }

  createTenant() {
    if (this.newTenant.name) {
      this.apiService.createTenant(this.newTenant as Omit<Tenant, 'id' | 'createdAt'>).subscribe({
        next: (tenant) => {
          this.tenants.push(tenant);
          this.newTenant = {};
          this.selectTenant(tenant);
        },
        error: (error) => console.error('Error creating tenant:', error)
      });
    }
  }
}

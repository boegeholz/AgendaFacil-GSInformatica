import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Service } from '../api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="services">
      <h1>Serviços</h1>

      <div class="actions">
        <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancelar' : 'Novo Serviço' }}
        </button>
      </div>

      <div *ngIf="showCreateForm" class="service-form">
        <h2>{{ editingService ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
        <form (ngSubmit)="saveService()" #serviceForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nome do Serviço:</label>
              <input type="text" id="name" [(ngModel)]="currentService.name" name="name" required>
            </div>
            <div class="form-group">
              <label for="price">Preço (R$):</label>
              <input type="number" id="price" [(ngModel)]="currentService.price" name="price" step="0.01" min="0" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="duration">Duração (minutos):</label>
              <input type="number" id="duration" [(ngModel)]="currentService.durationMinutes" name="duration" min="15" required>
            </div>
            <div class="form-group">
              <label for="active">Ativo:</label>
              <input type="checkbox" id="active" [(ngModel)]="currentService.isActive" name="active">
            </div>
          </div>
          <div class="form-group">
            <label for="description">Descrição:</label>
            <textarea id="description" [(ngModel)]="currentService.description" name="description" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="!serviceForm.valid">
              {{ editingService ? 'Atualizar' : 'Salvar' }}
            </button>
            <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="services-list">
        <div *ngFor="let service of services" class="service-card" [class.inactive]="!service.isActive">
          <div class="service-info">
            <h3>{{ service.name }}</h3>
            <p class="price">R$ {{ service.price | number:'1.2-2' }}</p>
            <p class="duration">{{ formatDuration(service.duration) }}</p>
            <p *ngIf="service.description" class="description">{{ service.description }}</p>
          </div>
          <div class="service-actions">
            <button class="btn-edit" (click)="editService(service)">Editar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services {
      max-width: 1000px;
      margin: 0 auto;
    }
    .actions {
      margin-bottom: 20px;
    }
    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #0056b3;
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    }
    .btn-secondary:hover {
      background: #545b62;
    }
    .service-form {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }
    .form-group {
      flex: 1;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
    .form-actions {
      margin-top: 20px;
    }
    .services-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .service-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .service-card.inactive {
      opacity: 0.6;
      background: #f8f9fa;
    }
    .service-info h3 {
      margin: 0 0 10px 0;
    }
    .price {
      font-size: 1.2em;
      font-weight: bold;
      color: #28a745;
      margin: 5px 0;
    }
    .duration {
      color: #666;
      margin: 5px 0;
    }
    .description {
      font-style: italic;
      color: #666;
      margin: 10px 0;
    }
    .service-actions {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .btn-edit {
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-edit:hover {
      background: #e0a800;
    }
  `]
})
export class ServicesComponent implements OnInit {
  private apiService = inject(ApiService);

  services: Service[] = [];
  showCreateForm = false;
  editingService: Service | null = null;
  currentService: any = { isActive: true, durationMinutes: 60 };

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.apiService.getServices().subscribe({
      next: (services) => this.services = services,
      error: (error) => console.error('Error loading services:', error)
    });
  }

  saveService() {
    const serviceData = {
      ...this.currentService,
      duration: `00:${this.currentService.durationMinutes}:00`
    };

    if (this.editingService) {
      // For update, we'd need an update endpoint
      alert('Funcionalidade de atualização será implementada');
    } else {
      this.apiService.createService(serviceData).subscribe({
        next: () => {
          this.loadServices();
          this.cancelEdit();
        },
        error: (error) => console.error('Error creating service:', error)
      });
    }
  }

  editService(service: Service) {
    this.editingService = service;
    this.currentService = {
      ...service,
      durationMinutes: this.parseDuration(service.duration)
    };
    this.showCreateForm = true;
  }

  cancelEdit() {
    this.showCreateForm = false;
    this.editingService = null;
    this.currentService = { isActive: true, durationMinutes: 60 };
  }

  formatDuration(duration: string): string {
    const [hours, minutes] = duration.split(':').map(Number);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} minutos`;
  }

  parseDuration(duration: string): number {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

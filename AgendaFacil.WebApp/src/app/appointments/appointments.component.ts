import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Appointment, Customer, Service, AppointmentStatus } from '../api.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="appointments">
      <h1>Agendamentos</h1>

      <div class="actions">
        <button class="btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Cancelar' : 'Novo Agendamento' }}
        </button>
      </div>

      <div *ngIf="showCreateForm" class="appointment-form">
        <h2>Novo Agendamento</h2>
        <form (ngSubmit)="saveAppointment()" #appointmentForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="customer">Cliente:</label>
              <select id="customer" [(ngModel)]="newAppointment.customerId" name="customer" required>
                <option value="">Selecione um cliente</option>
                <option *ngFor="let customer of customers" [value]="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="service">Serviço:</label>
              <select id="service" [(ngModel)]="newAppointment.serviceId" name="service" required>
                <option value="">Selecione um serviço</option>
                <option *ngFor="let service of services" [value]="service.id">
                  {{ service.name }} - R$ {{ service.price | number:'1.2-2' }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="date">Data:</label>
              <input type="date" id="date" [(ngModel)]="appointmentDate" name="date" required>
            </div>
            <div class="form-group">
              <label for="time">Horário:</label>
              <input type="time" id="time" [(ngModel)]="appointmentTime" name="time" required>
            </div>
          </div>
          <div class="form-group">
            <label for="notes">Observações:</label>
            <textarea id="notes" [(ngModel)]="newAppointment.notes" name="notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="!appointmentForm.valid">
              Agendar
            </button>
            <button type="button" class="btn-secondary" (click)="cancelCreate()">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="appointments-list">
        <h2>Próximos Agendamentos</h2>
        <div *ngFor="let appointment of upcomingAppointments" class="appointment-card" [class]="appointment.status.toLowerCase()">
          <div class="appointment-header">
            <h3>{{ appointment.customer?.name }}</h3>
            <span class="status">{{ getStatusLabel(appointment.status) }}</span>
          </div>
          <div class="appointment-details">
            <p><strong>Serviço:</strong> {{ appointment.service?.name }}</p>
            <p><strong>Data/Hora:</strong> {{ appointment.dateTime | date:'dd/MM/yyyy HH:mm' }}</p>
            <p *ngIf="appointment.notes"><strong>Observações:</strong> {{ appointment.notes }}</p>
          </div>
          <div class="appointment-actions">
            <button *ngIf="appointment.status === 'Scheduled'" class="btn-confirm" (click)="updateStatus(appointment, 'Confirmed')">Confirmar</button>
            <button *ngIf="appointment.status === 'Confirmed'" class="btn-complete" (click)="updateStatus(appointment, 'Completed')">Concluir</button>
            <button class="btn-cancel" (click)="updateStatus(appointment, 'Cancelled')">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments {
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
    .appointment-form {
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
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      margin-top: 20px;
    }
    .appointments-list h2 {
      margin-bottom: 20px;
    }
    .appointment-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      background: #e3f2fd;
      border-color: #2196f3;
    }
    .appointment-card.confirmed {
      background: #fff3e0;
      border-color: #ff9800;
    }
    .appointment-card.completed {
      background: #e8f5e8;
      border-color: #4caf50;
    }
    .appointment-card.cancelled {
      background: #ffebee;
      border-color: #f44336;
    }
    .appointment-card.noshow {
      background: #f3e5f5;
      border-color: #9c27b0;
    }
    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .appointment-header h3 {
      margin: 0;
    }
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: bold;
    }
    .appointment-details p {
      margin: 5px 0;
    }
    .appointment-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    .btn-confirm {
      background: #ff9800;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-confirm:hover {
      background: #f57c00;
    }
    .btn-complete {
      background: #4caf50;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-complete:hover {
      background: #45a049;
    }
    .btn-cancel {
      background: #f44336;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-cancel:hover {
      background: #d32f2f;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  private apiService = inject(ApiService);

  customers: Customer[] = [];
  services: Service[] = [];
  appointments: Appointment[] = [];
  showCreateForm = false;
  newAppointment: Partial<Appointment> = {};
  appointmentDate = '';
  appointmentTime = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getCustomers().subscribe({
      next: (customers) => this.customers = customers,
      error: (error) => console.error('Error loading customers:', error)
    });

    this.apiService.getServices().subscribe({
      next: (services) => this.services = services,
      error: (error) => console.error('Error loading services:', error)
    });

    this.apiService.getAppointments().subscribe({
      next: (appointments) => this.appointments = appointments,
      error: (error) => console.error('Error loading appointments:', error)
    });
  }

  saveAppointment() {
    if (this.appointmentDate && this.appointmentTime) {
      const dateTime = new Date(`${this.appointmentDate}T${this.appointmentTime}`);
      this.newAppointment.dateTime = dateTime.toISOString();

      this.apiService.createAppointment(this.newAppointment as Omit<Appointment, 'id' | 'tenantId' | 'createdAt' | 'reminderSentAt'>).subscribe({
        next: () => {
          this.loadData();
          this.cancelCreate();
        },
        error: (error) => console.error('Error creating appointment:', error)
      });
    }
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.newAppointment = {};
    this.appointmentDate = '';
    this.appointmentTime = '';
  }

  updateStatus(appointment: Appointment, status: string) {
    this.apiService.updateAppointmentStatus(appointment.id, status as AppointmentStatus).subscribe({
      next: () => {
        appointment.status = status as AppointmentStatus;
      },
      error: (error) => console.error('Error updating appointment status:', error)
    });
  }

  get upcomingAppointments() {
    const now = new Date();
    return this.appointments
      .filter(appointment => new Date(appointment.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels = {
      [AppointmentStatus.Scheduled]: 'Agendado',
      [AppointmentStatus.Confirmed]: 'Confirmado',
      [AppointmentStatus.Completed]: 'Concluído',
      [AppointmentStatus.Cancelled]: 'Cancelado',
      [AppointmentStatus.NoShow]: 'Faltou'
    };
    return labels[status] || status;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tenant {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Customer {
  id: number;
  tenantId: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: number;
  tenantId: number;
  name: string;
  description?: string;
  price: number;
  duration: string;
  isActive: boolean;
}

export interface Appointment {
  id: number;
  tenantId: number;
  customerId: number;
  serviceId: number;
  dateTime: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  reminderSentAt?: string;
  customer?: Customer;
  service?: Service;
}

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow'
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7244/api';
  private currentTenantId?: number;

  constructor(private http: HttpClient) { }

  setTenantId(tenantId: number) {
    this.currentTenantId = tenantId;
  }

  getTenantId(): number | undefined {
    return this.currentTenantId;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.currentTenantId) {
      headers = headers.set('X-Tenant-Id', this.currentTenantId.toString());
    }
    return headers;
  }

  // Tenant endpoints
  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.baseUrl}/tenants`);
  }

  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt'>): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.baseUrl}/tenants`, tenant);
  }

  // Customer endpoints
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`, { headers: this.getHeaders() });
  }

  createCustomer(customer: Omit<Customer, 'id' | 'tenantId' | 'createdAt'>): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, customer, { headers: this.getHeaders() });
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, customer, { headers: this.getHeaders() });
  }

  // Service endpoints
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`, { headers: this.getHeaders() });
  }

  createService(service: Omit<Service, 'id' | 'tenantId'>): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, service, { headers: this.getHeaders() });
  }

  // Appointment endpoints
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, { headers: this.getHeaders() });
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'tenantId' | 'createdAt' | 'reminderSentAt'>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment, { headers: this.getHeaders() });
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/status`, status, { headers: this.getHeaders() });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  private apiService = inject(ApiService);

  customers: Customer[] = [];
  showCreateForm = false;
  editingCustomer: Customer | null = null;
  currentCustomer: Partial<Customer> = {};

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.apiService.getCustomers().subscribe({
      next: (customers) => this.customers = customers,
      error: (error) => console.error('Error loading customers:', error)
    });
  }

  saveCustomer() {
    if (this.editingCustomer) {
      this.apiService.updateCustomer(this.editingCustomer.id, this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.cancelEdit();
        },
        error: (error) => console.error('Error updating customer:', error)
      });
    } else {
      this.apiService.createCustomer(this.currentCustomer as Omit<Customer, 'id' | 'tenantId' | 'createdAt'>).subscribe({
        next: () => {
          this.loadCustomers();
          this.cancelEdit();
        },
        error: (error) => console.error('Error creating customer:', error)
      });
    }
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = customer;
    this.currentCustomer = { ...customer };
    this.showCreateForm = true;
  }

  cancelEdit() {
    this.showCreateForm = false;
    this.editingCustomer = null;
    this.currentCustomer = {};
  }

  scheduleAppointment(customer: Customer) {
    // Navigate to appointments with customer pre-selected
    // This would require router navigation with state or a service
    alert(`Agendar para ${customer.name}`);
  }
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tenants', pathMatch: 'full' },
  {
    path: 'tenants',
    loadComponent: () => import('./tenant-selection/tenant-selection.component').then(m => m.TenantSelectionComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent)
      }
    ]
  }
];

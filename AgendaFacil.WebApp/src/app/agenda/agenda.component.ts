import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Appointment, AppointmentStatus } from '../api.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit {
  private apiService = inject(ApiService);

  appointments: Appointment[] = [];
  currentDate = new Date();
  viewMode: 'day' | 'week' = 'day';
  timeSlots: string[] = [];

  ngOnInit() {
    this.generateTimeSlots();
    this.loadAppointments();
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  loadAppointments() {
    this.apiService.getAppointments().subscribe({
      next: (appointments) => this.appointments = appointments,
      error: (error) => console.error('Error loading appointments:', error)
    });
  }

  setViewMode(mode: 'day' | 'week') {
    this.viewMode = mode;
  }

  previousPeriod() {
    if (this.viewMode === 'day') {
      this.currentDate = new Date(this.currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  nextPeriod() {
    if (this.viewMode === 'day') {
      this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
    } else {
      this.currentDate = new Date(this.currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  get weekDays() {
    const days = [];
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({ date: day });
    }
    return days;
  }

  getAppointmentsForTime(time: string): Appointment[] {
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(this.currentDate);
    slotTime.setHours(hours, minutes, 0, 0);

    return this.appointments.filter(appointment => {
      const appointmentTime = new Date(appointment.dateTime);
      return appointmentTime.toDateString() === slotTime.toDateString() &&
             appointmentTime.getHours() === hours &&
             appointmentTime.getMinutes() === minutes;
    });
  }

  getAppointmentsForDay(date: Date): Appointment[] {
    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  updateStatus(appointment: Appointment, status: string) {
    this.apiService.updateAppointmentStatus(appointment.id, status as AppointmentStatus).subscribe({
      next: () => {
        appointment.status = status as AppointmentStatus;
      },
      error: (error) => console.error('Error updating appointment status:', error)
    });
  }
}

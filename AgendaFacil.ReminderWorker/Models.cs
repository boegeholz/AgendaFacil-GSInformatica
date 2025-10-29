using Microsoft.EntityFrameworkCore;

namespace AgendaFacil.ReminderWorker;

public class AgendaDbContext : DbContext
{
    public AgendaDbContext(DbContextOptions<AgendaDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments { get; set; }
}

public class Appointment
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public int CustomerId { get; set; }
    public int ServiceId { get; set; }
    public DateTime DateTime { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReminderSentAt { get; set; }

    public Customer? Customer { get; set; }
    public Service? Service { get; set; }
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class Service
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
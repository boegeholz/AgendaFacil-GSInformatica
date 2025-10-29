using AgendaFacil.ReminderWorker;
using Microsoft.EntityFrameworkCore;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHttpClientFactory _httpClientFactory;

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _httpClientFactory = httpClientFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WhatsApp Reminder Worker started at: {time}", DateTimeOffset.Now);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking reminders");
            }

            // Check every 5 minutes
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AgendaDbContext>();

        var now = DateTime.UtcNow;

        // Find appointments that need 24h reminder
        var appointments24h = await dbContext.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Where(a => a.DateTime > now
                     && a.DateTime <= now.AddHours(24)
                     && a.ReminderSentAt == null
                     && a.Status == "Scheduled"
                     && a.Customer != null
                     && !string.IsNullOrEmpty(a.Customer.Phone))
            .ToListAsync();

        // Find appointments that need 1h reminder
        var appointments1h = await dbContext.Appointments
            .Include(a => a.Customer)
            .Include(a => a.Service)
            .Where(a => a.DateTime > now
                     && a.DateTime <= now.AddHours(1)
                     && a.ReminderSentAt != null
                     && a.Status == "Scheduled"
                     && a.Customer != null
                     && !string.IsNullOrEmpty(a.Customer.Phone))
            .ToListAsync();

        // Send 24h reminders
        foreach (var appointment in appointments24h)
        {
            await SendWhatsAppReminderAsync(appointment, 24);
            appointment.ReminderSentAt = now;
        }

        // Send 1h reminders
        foreach (var appointment in appointments1h)
        {
            await SendWhatsAppReminderAsync(appointment, 1);
            // Mark as sent (could add another field for 1h reminder)
        }

        await dbContext.SaveChangesAsync();

        _logger.LogInformation("Checked reminders: {count24h} 24h, {count1h} 1h reminders sent",
            appointments24h.Count, appointments1h.Count);
    }

    private async Task SendWhatsAppReminderAsync(Appointment appointment, int hoursBefore)
    {
        if (appointment.Customer?.Phone == null || appointment.Service == null)
            return;

        var message = hoursBefore == 24
            ? $"Olá {appointment.Customer.Name}! Lembrete: você tem um agendamento amanhã às {appointment.DateTime:HH:mm} para {appointment.Service.Name}."
            : $"Olá {appointment.Customer.Name}! Lembrete: você tem um agendamento em 1 hora às {appointment.DateTime:HH:mm} para {appointment.Service.Name}.";

        if (!string.IsNullOrEmpty(appointment.Notes))
        {
            message += $" Observações: {appointment.Notes}";
        }

        _logger.LogInformation("Sending WhatsApp reminder to {phone}: {message}",
            appointment.Customer.Phone, message);

        // TODO: Integrate with WhatsApp API (Twilio, Z-API, etc.)
        // For now, just log the message
        // Example with Twilio:
        // var client = new TwilioClient(accountSid, authToken);
        // await client.Messages.CreateAsync(new CreateMessageOptions(phoneNumber));

        // Simulate API call delay
        await Task.Delay(100);
    }
}

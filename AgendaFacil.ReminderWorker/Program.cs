using AgendaFacil.ReminderWorker;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();

// Add DbContext
builder.Services.AddDbContext<AgendaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AgendaFacilDB")));

// Add HttpClient for WhatsApp API calls
builder.Services.AddHttpClient();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();

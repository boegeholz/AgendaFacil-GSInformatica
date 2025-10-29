using AgendaFacil.WebAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add DbContext
builder.Services.AddDbContext<AgendaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AgendaFacilDB")));

builder.Services.AddCors(options =>  // Added CORS policy to allow requests from the app host
{
    options.AddPolicy("AllowAppHost", policy =>
        policy.WithOrigins("https://localhost:17083")  // Allow the app host origin
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAppHost");  // Added: Apply the CORS policy

// Middleware for tenant resolution (simple header-based for now)
app.Use(async (context, next) =>
{
    if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
    {
        if (int.TryParse(tenantIdHeader, out var tenantId))
        {
            context.Items["TenantId"] = tenantId;
        }
    }
    await next();
});

// API Endpoints

// Tenants
app.MapGet("/api/tenants", async (AgendaDbContext db) =>
    await db.Tenants.Where(t => t.IsActive).ToListAsync());

app.MapGet("/api/tenants/{id}", async (int id, AgendaDbContext db) =>
    await db.Tenants.FindAsync(id) is Tenant tenant ? Results.Ok(tenant) : Results.NotFound());

app.MapPost("/api/tenants", async (Tenant tenant, AgendaDbContext db) =>
{
    db.Tenants.Add(tenant);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tenants/{tenant.Id}", tenant);
});

// Customers (tenant-scoped)
app.MapGet("/api/customers", async (AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    return Results.Ok(await db.Customers.Where(c => c.TenantId == tenantId.Value).ToListAsync());
});

app.MapGet("/api/customers/{id}", async (int id, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);
    return customer is not null ? Results.Ok(customer) : Results.NotFound();
});

app.MapPost("/api/customers", async (Customer customer, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    customer.TenantId = tenantId.Value;
    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

app.MapPut("/api/customers/{id}", async (int id, Customer updatedCustomer, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId.Value);
    if (customer is null) return Results.NotFound();

    customer.Name = updatedCustomer.Name;
    customer.Phone = updatedCustomer.Phone;
    customer.Email = updatedCustomer.Email;
    customer.Notes = updatedCustomer.Notes;

    await db.SaveChangesAsync();
    return Results.Ok(customer);
});

// Services (tenant-scoped)
app.MapGet("/api/services", async (AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    return Results.Ok(await db.Services.Where(s => s.TenantId == tenantId.Value && s.IsActive).ToListAsync());
});

app.MapPost("/api/services", async (Service service, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    service.TenantId = tenantId.Value;
    db.Services.Add(service);
    await db.SaveChangesAsync();
    return Results.Created($"/api/services/{service.Id}", service);
});

// Appointments (tenant-scoped)
app.MapGet("/api/appointments", async (AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    return Results.Ok(await db.Appointments
        .Include(a => a.Customer)
        .Include(a => a.Service)
        .Where(a => a.TenantId == tenantId.Value)
        .OrderBy(a => a.DateTime)
        .ToListAsync());
});

app.MapPost("/api/appointments", async (Appointment appointment, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    appointment.TenantId = tenantId.Value;
    db.Appointments.Add(appointment);
    await db.SaveChangesAsync();
    return Results.Created($"/api/appointments/{appointment.Id}", appointment);
});

app.MapPut("/api/appointments/{id}/status", async (int id, AppointmentStatus status, AgendaDbContext db, HttpContext context) =>
{
    var tenantId = GetTenantId(context);
    if (!tenantId.HasValue) return Results.BadRequest("Tenant ID required");

    var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId.Value);
    if (appointment is null) return Results.NotFound();

    appointment.Status = status;
    await db.SaveChangesAsync();
    return Results.Ok(appointment);
});

// Helper method
static int? GetTenantId(HttpContext context) => context.Items["TenantId"] as int?;

app.Run();

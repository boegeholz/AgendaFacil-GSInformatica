var builder = DistributedApplication.CreateBuilder(args);

   var sqlDb = builder.AddSqlServer("sqlserver")
                      .AddDatabase("AgendaFacilDB");
   var apiService = builder.AddProject<Projects.AgendaFacil_WebAPI>("agendafacil-webapi");

   builder.AddProject<Projects.AgendaFacil_ReminderWorker>("agendafacil-reminderworker");

   builder.AddNpmApp("angular-frontend", "../AgendaFacil.WebApp", "start")
          .WithHttpEndpoint(port: 4200, isProxied: false);

   builder.Build().Run();

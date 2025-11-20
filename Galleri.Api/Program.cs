using System.Reflection;
using Galleri.Api.Data;
using Galleri.Api.Services;
using Galleri.Api.Services.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FirebaseSettings>(builder.Configuration.GetSection("Firebase"));
builder.Services.Configure<UploadSettings>(builder.Configuration.GetSection("Upload"));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<IFirebaseTokenValidator, FirebaseTokenValidator>();
builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = FirebaseAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = FirebaseAuthenticationDefaults.AuthenticationScheme;
}).AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>(
    FirebaseAuthenticationDefaults.AuthenticationScheme, options => { });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://localhost:5173",
                  "https://localhost:5173",
                  "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (IsRunningEntityFrameworkCommands())
{
    return;
}

app.Run();

static bool IsRunningEntityFrameworkCommands()
{
    return AppDomain.CurrentDomain
        .GetAssemblies()
        .Any(assembly => assembly.FullName?.StartsWith("Microsoft.EntityFrameworkCore.Design", StringComparison.Ordinal) == true);
}

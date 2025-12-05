using Galleri.Api.Data;
using Galleri.Api.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Net;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Bind Firebase settings and initialize Firebase Admin SDK
builder.Services.Configure<FirebaseSettings>(builder.Configuration.GetSection("Firebase"));
// It reads the service account JSON from your user secrets (or environment variables in production)
var firebaseConfig = builder.Configuration["Firebase:ServiceAccountKeyJson"];
if (!string.IsNullOrEmpty(firebaseConfig))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromJson(firebaseConfig)
    });
}

builder.Services.Configure<UploadSettings>(builder.Configuration.GetSection("Upload"));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();

// Add standard JWT Bearer authentication for Firebase
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var firebaseProjectId = builder.Configuration["Firebase:ProjectId"];
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

// Add admin-only authorization policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("IsAdmin", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireAssertion(context =>
        {
            var userUid = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var requiredAdminUid = builder.Configuration["Admin:Uid"];
            return !string.IsNullOrEmpty(userUid) && userUid == requiredAdminUid;
        });
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://localhost:5173",
                  "https://localhost:5173",
                  "http://127.0.0.1:5173",
                  "http://localhost:5174",
                  "http://72.62.51.200",
                  "https://jesne.art",
                  "https://www.jesne.art")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

// Basic rate limiting to help mitigate abuse (global policy)
builder.Services.AddRateLimiter(options =>
{
    // Global limiter: 200 requests per minute per IP (for non-sensitive endpoints)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, IPAddress>(httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress ?? IPAddress.None;
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 200,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
    // Strict rate limiter for admin endpoints: 20 requests per minute per IP (prevent brute force)
    options.AddPolicy("StrictAdminLimit", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress ?? IPAddress.None;
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 20,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
    // Strict rate limiter for uploads: 10 requests per minute per IP (prevent upload spam)
    options.AddPolicy("UploadLimit", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress ?? IPAddress.None;
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 10,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
    options.RejectionStatusCode = 429;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    // Clear any historical placeholder model paths so they are not stored on artworks.
    try
    {
        db.Database.ExecuteSqlRaw("UPDATE Artworks SET ModelPath = NULL WHERE ModelPath = '/models/textured.glb'");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Program");
        logger.LogWarning(ex, "Failed to clear placeholder ModelPath values during startup migration step.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("FrontendPolicy");
// Add some helpful security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    await next();
});

app.UseRateLimiter();
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

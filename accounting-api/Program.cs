using System.Text;
using AccountingApi.Data;
using AccountingApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5064");

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication (Dummy in Dev, JWT in Prod)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddAuthentication("Test")
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
}
else
{
    var jwtKey = builder.Configuration["Jwt:Key"]!;
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            };
        });
}

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();

// CORS - Mobile app
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Accounting API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed mock data
app.SeedData();

// Handle forwarded headers from ngrok/reverse proxy
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Accounting API v1"));
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

class TestAuthHandler : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>
{
    public TestAuthHandler(
        Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        System.Text.Encodings.Web.UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override async Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
    {
        using var scope = Context.RequestServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AccountingApi.Data.AppDbContext>();
        var user = await db.Users.FirstOrDefaultAsync();
        
        var userId = user?.Id.ToString() ?? "1";
        var claims = new[] { 
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, userId),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, user?.Email ?? "dev@local.com")
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, "Test");
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, "Test");
        return Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket);
    }
}

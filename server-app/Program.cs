using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server_app.Data;
using server_app.Models;
using server_app.Services;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{

    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;

});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();


builder.Logging.AddFilter("Microsoft.AspNetCore.Cors", LogLevel.Debug);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder.WithOrigins("http://localhost:3000") 
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});



builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = "Spotify";

//})
//    .AddCookie(options =>
//    {
//        options.Cookie.HttpOnly = true;
//        options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.Always;
//        options.LoginPath = "/api/Auth/login";
//        options.LogoutPath = "/api/Auth/logout";
//        options.SlidingExpiration = true;
//    }
//    )
//    .AddOAuth("Spotify", options =>
//    {
//        options.ClientId = builder.Configuration["Spotify:ClientId"];
//        options.ClientSecret = builder.Configuration["Spotify:ClientSecret"];
//        options.CallbackPath = "/api/Auth/callback";
//        options.AuthorizationEndpoint = "https://accounts.spotify.com/authorize";
//        options.TokenEndpoint = "https://accounts.spotify.com/api/token";
//        options.Scope.Add("user-read-email");
//        options.Scope.Add("user-read-private");
//        options.SaveTokens = true;
//        options.Events = new OAuthEvents
//        {
//            OnCreatingTicket = async context =>
//            {
//                var accessToken = context.AccessToken;
//                var refreshToken = context.RefreshToken;
//                //var expiresAt = DateTime.Now.AddSeconds(context.ExpiresIn.Value);

//                Console.WriteLine($"Access Token: {accessToken}");

//                var spotifyService = context.HttpContext.RequestServices.GetRequiredService<SpotifyService>();
//                var userInfo = await spotifyService.FetchAndUpdateUserProfile(accessToken);


//                var claims = new List<Claim>
//                {
//                    new Claim(ClaimTypes.NameIdentifier, userInfo.Id),
//                    new Claim(ClaimTypes.Email, userInfo.Email),
//                    new Claim("AccessToken", accessToken),
//                    new Claim("RefreshToken", refreshToken)
//                };

//                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
//                var authProperties = new AuthenticationProperties
//                {
//                    IsPersistent = true,
//                    ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(60)
//                };

//                await context.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), authProperties);


//                Console.WriteLine($"User Info: {userInfo.Id} , {userInfo.Email}");

//                await spotifyService.SaveOrUpdateUser(userInfo, accessToken, refreshToken);
//            }
//        };
//    });


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });


builder.Services.AddScoped<SpotifyService>();
builder.Services.AddScoped<PlaylistService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

//app.Use(async (context, next) =>
//{
//    if (context.Request.Method == "OPTIONS")
//    {
//        context.Response.StatusCode = 200;
//        // Add any necessary CORS headers here if needed.
//        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
//        context.Response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
//        return;
//    }

//    await next();
//});


//app.UseCors(action => action.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();


app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});
app.Run();

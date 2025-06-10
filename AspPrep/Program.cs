using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AspPrep.Data;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;
using System.IO;

record SeedUser(string Email, string Password, string[] Roles);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Seed default roles and admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
    var roles = new[] { "Admin", "User" };
    foreach (var role in roles)
    {
        if (!roleManager.RoleExistsAsync(role).Result)
        {
            roleManager.CreateAsync(new IdentityRole(role)).Wait();
        }
    }

    var seedFile = Path.Combine(app.Environment.ContentRootPath, "seedUsers.json");
    if (File.Exists(seedFile))
    {
        var json = File.ReadAllText(seedFile);
        var seedUsers = JsonSerializer.Deserialize<List<SeedUser>>(json);
        if (seedUsers != null)
        {
            foreach (var seed in seedUsers)
            {
                var user = userManager.FindByEmailAsync(seed.Email).Result;
                if (user == null)
                {
                    user = new IdentityUser { UserName = seed.Email, Email = seed.Email, EmailConfirmed = true };
                    userManager.CreateAsync(user, seed.Password).Wait();
                }
                foreach (var role in seed.Roles)
                {
                    if (!userManager.IsInRoleAsync(user, role).Result)
                    {
                        userManager.AddToRoleAsync(user, role).Wait();
                    }
                }
            }
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapRazorPages()
   .WithStaticAssets();

app.Run();

# AspPrep Guide

## Table of Contents
1. [Creating Migrations](#creating-migrations)  
2. [Creating Controllers and Views](#creating-controllers-and-views)  
3. [Creating Razor Pages](#creating-razor-pages)  
4. [Getting Data from the Database](#getting-data-from-the-database)  
5. [Authentication and Roles](#authentication-and-roles)  
6. [Adding VSCode Snippets](#adding-vscode-snippets)  
7. [Useful Commands and Tips](#useful-commands-and-tips)  

---

## Database Setup

1. From the project folder (`AspPrep`), run the SQL Server container and create the `examen-paw` database:
   ```bash
   ../start-sql.sh
   ```
2. Confirm that `appsettings.json` under `AspPrep` uses the connection string:
   ```
   "DefaultConnection": "Server=localhost,1433;Database=examen-paw;User Id=sa;Password=StrongPassword123!!!;TrustServerCertificate=true;"
   ```

## Creating Migrations

1. Open a terminal in the project root (`AspPrep` folder).  
2. Add a new migration:
   ```bash
   dotnet ef migrations add <MigrationName>
   ```
3. Apply pending migrations to the database:
   ```bash
   dotnet ef database update
   ```
4. If you modify a model, repeat steps to generate a new migration reflecting schema changes.

---

## Creating Controllers and Views

- Scaffold a new MVC controller and views:
  ```bash
  dotnet aspnet-codegenerator controller \
    -name YourController \
    -m YourModel \
    -dc ApplicationDbContext \
    --relativeFolderPath Controllers \
    --useDefaultLayout \
    --referenceScriptLibraries
  ```
- Manual template for a controller:
  ```csharp
  public class SampleController : Controller
  {
      private readonly ApplicationDbContext _context;
      public SampleController(ApplicationDbContext context)
      {
          _context = context;
      }
      public async Task<IActionResult> Index()
      {
          var items = await _context.Entities.ToListAsync();
          return View(items);
      }
  }
  ```

---

## Creating Razor Pages

- Add a Razor Page via CLI:
  ```bash
  dotnet aspnet-codegenerator razorpage \
    -name YourPage \
    -m YourModel \
    -dc ApplicationDbContext \
    --relativeFolderPath Pages
  ```
- Manual Razor page template:
  ```cshtml
  @page
  @model YourPageModel
  <h1>Your Title</h1>
  ```

---

## Getting Data from the Database

- Inject the DbContext in a view or page:
  ```cshtml
  @inject ApplicationDbContext DbContext
  ```
- Query example in a page model or controller:
  ```csharp
  var list = await _context.Items
      .Where(i => i.IsActive)
      .OrderBy(i => i.Name)
      .ToListAsync();
  ```

---

## Authentication and Roles

- Register roles and seed an admin account (already set up in `Program.cs`).  
- Protect a controller or action by role:
  ```csharp
  [Authorize(Roles = "Admin")]
  public IActionResult AdminDashboard()
  {
      return View();
  }
  ```
- Ensure Anonymous users are redirected:
  ```csharp
  app.UseAuthentication();
  app.UseAuthorization();
  ```

---

## Adding VSCode Snippets

Custom snippets are provided in `.vscode/asp-prep.code-snippets`.  
To enable snippets:
1. Copy the entire `.vscode` folder into your project root.  
2. Restart VSCode or reload the window.  
3. In any C# file or terminal, type the snippet prefix and press **Tab**.

---

## Useful Commands and Tips

- Run the application:
  ```bash
  dotnet run
  ```
- Access the database file `app.db` with a SQLite viewer.  
- Use `dotnet watch run` to auto-restart on code changes.  
- For scaffolding help:
  ```bash
  dotnet aspnet-codegenerator --help

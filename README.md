# Template PAW - ASP.NET Core Exam Template

A complete code generation system for ASP.NET Core applications with Entity Framework, designed for exam scenarios without internet access.

## Quick Start

### 1. Database Setup
```bash
# Start SQL Server container
./start-sql.sh

# The application will automatically create the database and tables on first run
```

### 2. Generate Code
```bash
# Install dependencies
npm install

# Generate all models, controllers, and views
npm run generate:all

# Or generate specific parts
npm run generate:models      # Entity models
npm run generate:context     # DbContext  
npm run generate:controllers # Controllers and views
```

### 3. Run Application
```bash
cd AspPrep
dotnet run
```

Application will be available at `https://localhost:5001`

### 4. Default Admin User
Default admin credentials are specified in `generator/appdescription.ts` under `seedUsers`.

## Code Generation System

### Schema Definition
Edit `generator/appdescription.ts` to define your entities, properties, and page operations:

```typescript
const appDescription = {
  entities: [
    {
      name: "Product",
      table: "PRODUCTS", 
      properties: [
        {
          name: "Name",
          type: "string",
          required: true,
          minLength: 3,
          maxLength: 100,
          regex: "^[A-Za-z0-9 ]+$"
        },
        { name: "Price", type: "float", required: true, min: 0, max: 10000 },
        { name: "Category", type: "enum", required: true, options: ["Electronics", "Books", "Clothing"] }
      ]
    }
  ],
  roles: [
    { name: "Admin", setOnDefault: true }
  ],
  pages: [
    {
      entity: "Product",
      operations: [
        { type: "list" },                    // Public access
        { type: "create", requiredRole: "Admin" }, // Admin only
        { type: "update", requiredRole: "Admin" },
        { type: "delete", requiredRole: "Admin" }
      ]
    }
  ]
};
```

### Supported Field Types
- **string**: Text with min/max length validation or regex pattern
- **int/float**: Numbers with min/max value validation  
- **DateTime**: Date and time picker
- **boolean**: Checkbox
- **enum**: Dropdown select with predefined options

### Helpful Regex Examples
Here are some regular expressions you can reuse in property definitions:
- **Email**: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Phone number**: `^\+?[0-9]{10,15}$`
- **URL**: `^(https?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$`

### Generated Features
- ✅ Entity models with data annotations
- ✅ DbContext with relationships
- ✅ CRUD controllers with role authorization
- ✅ Bootstrap-styled Razor views
- ✅ Client and server-side validation
- ✅ Pre-filled edit forms
- ✅ Confirmation dialogs for delete

## Manual Development Guide

### Creating Migrations
```bash
# Add migration (if dotnet ef works)
cd AspPrep
dotnet ef migrations add MigrationName

# Or use the helper script
../create-migration.sh
```

### Creating Controllers and Views
```bash
# Scaffold controller with views
dotnet aspnet-codegenerator controller \
  -name ProductController \
  -m Product \
  -dc ApplicationDbContext \
  --relativeFolderPath Controllers \
  --useDefaultLayout \
  --referenceScriptLibraries
```

### Manual Controller Template
```csharp
[Authorize(Roles = "Admin")]
public class ProductController : Controller
{
    private readonly ApplicationDbContext _context;
    
    public ProductController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<IActionResult> Index()
    {
        var products = await _context.Products.ToListAsync();
        return View(products);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(Product product)
    {
        if (ModelState.IsValid)
        {
            _context.Add(product);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(product);
    }
}
```

### Getting Data from Database
```csharp
// In controller or page model
var items = await _context.Products
    .Where(p => p.IsActive)
    .Include(p => p.Category)
    .OrderBy(p => p.Name)
    .ToListAsync();
```

### Authentication and Roles
```csharp
// Protect controller/action
[Authorize(Roles = "Admin")]
public IActionResult AdminOnly() { return View(); }

// Check user role in view
@if (User.IsInRole("Admin"))
{
    <a href="/Admin/Dashboard">Admin Panel</a>
}
```

### Creating Razor Pages
```bash
# Scaffold Razor page
dotnet aspnet-codegenerator razorpage \
  -name ProductPage \
  -m Product \
  -dc ApplicationDbContext \
  --relativeFolderPath Pages
```

### VSCode Snippets
Custom snippets are provided in `AspPrep/.vscode/asp-prep.code-snippets`:
- Type snippet prefix and press Tab
- Includes common controller actions, view templates, etc.

### Database Connection
The application uses SQL Server by default. Connection string in `AspPrep/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1455;Database=examen-paw;User Id=sa;Password=StrongPassword123!!!;TrustServerCertificate=true;"
  }
}
```

### Useful Commands
```bash
# Run with auto-restart on changes
cd AspPrep && dotnet watch run

# Build project
dotnet build

# Restore packages
dotnet restore

# View scaffolding help
dotnet aspnet-codegenerator --help
```

## Project Structure
```
├── AspPrep/                 # ASP.NET Core application
│   ├── Models/             # Entity models (generated)
│   ├── Controllers/        # MVC controllers (generated)
│   ├── Views/             # Razor views (generated)
│   ├── Data/              # DbContext and migrations
│   └── wwwroot/           # Static files
├── generator/              # Code generation system
│   ├── appdescription.ts  # Schema definition
│   ├── definitions.ts     # Type definitions
│   ├── generate.ts        # CLI generator
│   └── templates/         # Handlebars templates
└── start-sql.sh           # SQL Server startup script
```

## Exam Tips
- Edit `generator/appdescription.ts` to match exam requirements
- Run `npm run generate:all` to create all CRUD functionality
- Use provided snippets for faster development
- All validation is automatically generated from schema
- Default admin user is pre-configured
- No internet required after initial setup

```C#
var humanCount  = await _context.Participant
.CountAsync(p => p.AtelierId == item.AtelierId);

if (humanCount >= item.Atelier!.NrMaxParticipanti)
{
  ModelState.AddModelError("AtelierId", "Atelierul a atins numarul maxim de participanti.");
  return View();
}
```
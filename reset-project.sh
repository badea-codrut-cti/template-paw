#!/bin/bash

echo "Resetting project to clean state..."

# Remove generated files
rm -rf AspPrep/Models/Concurs.cs AspPrep/Models/Concurent.cs 2>/dev/null
rm -rf AspPrep/Controllers/ConcursController.cs AspPrep/Controllers/ConcurentController.cs 2>/dev/null
rm -rf AspPrep/Views/Concurs AspPrep/Views/Concurent 2>/dev/null

# Remove all migrations except Identity
cd AspPrep
find Data/Migrations -name "*.cs" ! -name "*InitialIdentity*" -delete 2>/dev/null

# Reset DbContext to clean state
cat > Data/ApplicationDbContext.cs << 'EOF'
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AspPrep.Models;

namespace AspPrep.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
EOF

echo "Project reset complete. Ready for code generation."

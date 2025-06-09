#!/bin/bash

echo "Resetting project to clean state..."

# Remove generated model classes except the scaffold defaults
find AspPrep/Models -name '*.cs' ! -name 'ErrorViewModel.cs' -delete 2>/dev/null

# Remove generated controllers but keep the default Home controller
find AspPrep/Controllers -name '*Controller.cs' ! -name 'HomeController.cs' -delete 2>/dev/null

# Remove generated view folders except Home and Shared
find AspPrep/Views -mindepth 1 -maxdepth 1 -type d ! -name 'Home' ! -name 'Shared' -exec rm -rf {} + 2>/dev/null

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

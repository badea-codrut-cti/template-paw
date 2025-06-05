#!/bin/bash

# Create migration using dotnet run with EF Design package
cd AspPrep
dotnet tool run dotnet-ef migrations add InitialCreate --output-dir Data/Migrations
dotnet ef database update

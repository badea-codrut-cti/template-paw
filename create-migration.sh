#!/bin/bash

# Create migration using dotnet run with EF Design package
cd AspPrep
dotnet ef migrations add InitialCreate
dotnet ef database update

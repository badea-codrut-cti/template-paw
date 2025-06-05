#!/usr/bin/env bash
# start_mssql_container.sh
# Spins up a Microsoft SQL Server 2022 container and creates the 'news_db' database.

set -e

CONTAINER_NAME="examen-mssql"
SA_PASSWORD="StrongPassword123!!!"
DB_NAME="examen-paw"
IMAGE_NAME="mcr.microsoft.com/mssql/server:2022-latest"

# Remove any existing container with the same name
if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
  echo "Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}"
fi

# Run SQL Server container
docker run -e "ACCEPT_EULA=Y" \
           -e "SA_PASSWORD=${SA_PASSWORD}" \
           -p 1455:1433 \
           --name "${CONTAINER_NAME}" \
           -d "${IMAGE_NAME}"

echo "Waiting for SQL Server to initialize (this may take 15-20 seconds)..."
sleep 20
echo "Creating database '${DB_NAME}'..."
docker exec "${CONTAINER_NAME}" /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -C -Q "IF DB_ID('${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}];"

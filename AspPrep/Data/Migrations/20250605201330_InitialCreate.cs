using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AspPrep.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CONCURS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nume = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Categorie = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NrMaxParticipanti = table.Column<int>(type: "int", nullable: false),
                    RestrictieVarsta = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CONCURS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CONCURENT",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nume = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Prenume = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataNasterii = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Tara = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ConcursId = table.Column<int>(type: "int", nullable: false),
                    ConcurentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CONCURENT", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CONCURENT_CONCURS_ConcurentId",
                        column: x => x.ConcurentId,
                        principalTable: "CONCURS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CONCURENT_ConcurentId",
                table: "CONCURENT",
                column: "ConcurentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CONCURENT");

            migrationBuilder.DropTable(
                name: "CONCURS");
        }
    }
}

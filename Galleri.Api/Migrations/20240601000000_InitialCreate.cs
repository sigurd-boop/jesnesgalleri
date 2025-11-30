using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Galleri.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Artworks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: false),
                    ModelPath = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    Category = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true, defaultValue: "collection"),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 2048, nullable: true),
                    ImageStoragePath = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    GalleryShots = table.Column<string>(type: "TEXT", nullable: true),
                    GalleryShotStoragePaths = table.Column<string>(type: "TEXT", nullable: true),
                    PostedAt = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    Tags = table.Column<string>(type: "TEXT", nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Artworks", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Artworks");
        }
    }
}

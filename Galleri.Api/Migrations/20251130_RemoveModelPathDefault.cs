using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Galleri.Api.Migrations
{
    public partial class RemoveModelPathDefault : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SQLite doesn't support altering column defaults easily; recreate the table without the default.
            migrationBuilder.Sql(@"
                BEGIN TRANSACTION;
                CREATE TABLE Artworks_new (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Title TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    ModelPath TEXT,
                    Category TEXT DEFAULT 'collection',
                    ImageUrl TEXT,
                    ImageStoragePath TEXT,
                    GalleryShots TEXT,
                    GalleryShotStoragePaths TEXT,
                    PostedAt TEXT,
                    Tags TEXT,
                    DisplayOrder INTEGER,
                    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt TEXT
                );
                INSERT INTO Artworks_new (Id, Title, Description, ModelPath, Category, ImageUrl, ImageStoragePath, GalleryShots, GalleryShotStoragePaths, PostedAt, Tags, DisplayOrder, CreatedAt, UpdatedAt)
                SELECT Id, Title, Description, CASE WHEN ModelPath = '/models/textured.glb' THEN NULL ELSE ModelPath END, Category, ImageUrl, ImageStoragePath, GalleryShots, GalleryShotStoragePaths, PostedAt, Tags, DisplayOrder, CreatedAt, UpdatedAt
                FROM Artworks;
                DROP TABLE Artworks;
                ALTER TABLE Artworks_new RENAME TO Artworks;
                COMMIT;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate the original table with the default value on ModelPath
            migrationBuilder.Sql(@"
                BEGIN TRANSACTION;
                CREATE TABLE Artworks_old (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Title TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    ModelPath TEXT DEFAULT '/models/textured.glb',
                    Category TEXT DEFAULT 'collection',
                    ImageUrl TEXT,
                    ImageStoragePath TEXT,
                    GalleryShots TEXT,
                    GalleryShotStoragePaths TEXT,
                    PostedAt TEXT,
                    Tags TEXT,
                    DisplayOrder INTEGER,
                    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt TEXT
                );
                INSERT INTO Artworks_old (Id, Title, Description, ModelPath, Category, ImageUrl, ImageStoragePath, GalleryShots, GalleryShotStoragePaths, PostedAt, Tags, DisplayOrder, CreatedAt, UpdatedAt)
                SELECT Id, Title, Description, COALESCE(ModelPath, '/models/textured.glb'), Category, ImageUrl, ImageStoragePath, GalleryShots, GalleryShotStoragePaths, PostedAt, Tags, DisplayOrder, CreatedAt, UpdatedAt
                FROM Artworks;
                DROP TABLE Artworks;
                ALTER TABLE Artworks_old RENAME TO Artworks;
                COMMIT;
            ");
        }
    }
}

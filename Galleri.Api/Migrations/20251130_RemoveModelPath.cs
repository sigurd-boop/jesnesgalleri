using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Galleri.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveModelPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModelPath",
                table: "Artworks");

            migrationBuilder.DropColumn(
                name: "PostedAt",
                table: "Artworks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModelPath",
                table: "Artworks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostedAt",
                table: "Artworks",
                type: "TEXT",
                maxLength: 64,
                nullable: true);
        }
    }
}

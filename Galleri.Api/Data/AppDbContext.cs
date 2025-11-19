using Galleri.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Galleri.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Artwork> Artworks => Set<Artwork>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Artwork>(entity =>
        {
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasMaxLength(2000);

            entity.Property(e => e.ImageUrl)
                .HasMaxLength(2048);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        base.OnModelCreating(modelBuilder);
    }
}

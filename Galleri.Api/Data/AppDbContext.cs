using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Galleri.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Galleri.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Artwork> Artworks => Set<Artwork>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var listConverter = new ValueConverter<List<string>?, string?>(
            value => SerializeList(value),
            value => DeserializeList(value));

        var listComparer = new ValueComparer<List<string>?>(
            (left, right) => SequenceEqual(left, right),
            value => ComputeHash(value),
            value => value == null ? new List<string>() : value.ToList());

        void ConfigureStringList(PropertyBuilder<List<string>?> builder)
        {
            builder.HasConversion(listConverter);
            builder.Metadata.SetValueComparer(listComparer);
        }

        modelBuilder.Entity<Artwork>(entity =>
        {
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasMaxLength(4000)
                .IsRequired();

            entity.Property(e => e.Category)
                .HasMaxLength(64)
                .HasDefaultValue("collection");

            entity.Property(e => e.ImageUrl)
                .HasMaxLength(2048);

            entity.Property(e => e.ImageStoragePath)
                .HasMaxLength(512);

            ConfigureStringList(entity.Property(e => e.GalleryShots));
            ConfigureStringList(entity.Property(e => e.GalleryShotStoragePaths));
            ConfigureStringList(entity.Property(e => e.Tags));

            entity.Property(e => e.DisplayOrder);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        base.OnModelCreating(modelBuilder);
    }

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    private static string? SerializeList(List<string>? value)
    {
        if (value == null || value.Count == 0)
        {
            return null;
        }

        return JsonSerializer.Serialize(value, SerializerOptions);
    }

    private static List<string>? DeserializeList(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return new List<string>();
        }

        return JsonSerializer.Deserialize<List<string>>(value, SerializerOptions) ?? new List<string>();
    }

    private static bool SequenceEqual(List<string>? left, List<string>? right)
    {
        return (left ?? new List<string>()).SequenceEqual(right ?? new List<string>());
    }

    private static int ComputeHash(List<string>? value)
    {
        var aggregate = 0;
        var source = value ?? new List<string>();
        foreach (var item in source)
        {
            var itemHash = item?.GetHashCode() ?? 0;
            aggregate = HashCode.Combine(aggregate, itemHash);
        }

        return aggregate;
    }
}

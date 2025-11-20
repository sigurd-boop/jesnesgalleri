using System.Collections.Generic;

namespace Galleri.Api.Models;

public class Artwork
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ModelPath { get; set; } = "/models/textured.glb";
    public string Category { get; set; } = "collection";
    public string? ImageUrl { get; set; }
    public string? ImageStoragePath { get; set; }
    public List<string>? GalleryShots { get; set; }
    public List<string>? GalleryShotStoragePaths { get; set; }
    public string? PostedAt { get; set; }
    public List<string>? Tags { get; set; }
    public int? DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
}

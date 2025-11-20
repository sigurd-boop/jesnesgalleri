using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Galleri.Api.DTOs;

public class CreateArtworkDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(512)]
    public string? ModelPath { get; set; }

    [MaxLength(64)]
    public string? Category { get; set; }

    [MaxLength(2048)]
    public string? ImageUrl { get; set; }

    [MaxLength(512)]
    public string? ImageStoragePath { get; set; }

    public List<string>? GalleryShots { get; set; }

    public List<string>? GalleryShotStoragePaths { get; set; }

    [MaxLength(64)]
    public string? PostedAt { get; set; }

    public List<string>? Tags { get; set; }

    public int? DisplayOrder { get; set; }
}

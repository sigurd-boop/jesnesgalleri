using System.ComponentModel.DataAnnotations;

namespace Galleri.Api.DTOs;

public class CreateArtworkDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(2048)]
    public string? ImageUrl { get; set; }
}

using System.Collections.Generic;
using System.Linq;
using Galleri.Api.Data;
using Galleri.Api.DTOs;
using Galleri.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Galleri.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtworksController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ArtworksController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Artwork>>> GetAllAsync()
    {
        var artworks = await _dbContext.Artworks
            .OrderBy(a => a.DisplayOrder.HasValue ? a.DisplayOrder : int.MaxValue)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(artworks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Artwork>> GetByIdAsync(int id)
    {
        var artwork = await _dbContext.Artworks.FindAsync(id);
        if (artwork is null)
        {
            return NotFound();
        }

        return Ok(artwork);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Artwork>> CreateAsync([FromBody] CreateArtworkDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var artwork = new Artwork
        {
            CreatedAt = DateTime.UtcNow
        };

        ApplyDtoToArtwork(artwork, dto);
        artwork.UpdatedAt = DateTime.UtcNow;

        _dbContext.Artworks.Add(artwork);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByIdAsync), new { id = artwork.Id }, artwork);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Artwork>> UpdateAsync(int id, [FromBody] CreateArtworkDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var artwork = await _dbContext.Artworks.FindAsync(id);
        if (artwork is null)
        {
            return NotFound();
        }

        ApplyDtoToArtwork(artwork, dto);
        artwork.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(artwork);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var artwork = await _dbContext.Artworks.FindAsync(id);
        if (artwork is null)
        {
            return NotFound();
        }

        _dbContext.Artworks.Remove(artwork);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private static void ApplyDtoToArtwork(Artwork artwork, CreateArtworkDto dto)
    {
        artwork.Title = NormalizeRequired(dto.Title);
        artwork.Description = NormalizeRequired(dto.Description);
        artwork.ModelPath = NormalizeOptional(dto.ModelPath) ?? artwork.ModelPath;
        artwork.Category = NormalizeOptional(dto.Category) ?? "collection";
        artwork.ImageUrl = NormalizeOptional(dto.ImageUrl);
        artwork.ImageStoragePath = NormalizeOptional(dto.ImageStoragePath);
        artwork.PostedAt = NormalizeOptional(dto.PostedAt);
        artwork.DisplayOrder = dto.DisplayOrder;
        artwork.GalleryShots = NormalizeList(dto.GalleryShots);
        artwork.GalleryShotStoragePaths = NormalizeList(dto.GalleryShotStoragePaths);
        artwork.Tags = NormalizeList(dto.Tags);
    }

    private static string NormalizeRequired(string value) => value?.Trim() ?? string.Empty;

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static List<string>? NormalizeList(IEnumerable<string>? values)
    {
        if (values is null)
        {
            return null;
        }

        var normalized = values
            .Select(value => value?.Trim())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Cast<string>()
            .ToList();

        return normalized.Count == 0 ? null : normalized;
    }
}

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
            .OrderByDescending(a => a.CreatedAt)
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
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Artworks.Add(artwork);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByIdAsync), new { id = artwork.Id }, artwork);
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
}

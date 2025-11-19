using System.IO;
using System.Linq;
using System.Threading;
using Galleri.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Galleri.Api.Controllers;

[ApiController]
[Route("api/upload-image")]
public class UploadController : ControllerBase
{
    private static readonly string[] AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly IImageStorageService _imageStorageService;

    public UploadController(IImageStorageService imageStorageService)
    {
        _imageStorageService = imageStorageService;
    }

    [Authorize]
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadAsync([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest("Unsupported image format.");
        }

        var imageUrl = await _imageStorageService.SaveImageAsync(file, cancellationToken);
        return Ok(new { imageUrl });
    }
}

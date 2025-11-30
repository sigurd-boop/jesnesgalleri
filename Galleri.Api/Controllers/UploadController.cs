using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using Galleri.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Galleri.Api.Controllers;

[ApiController]
[Route("api/upload-image")]
public class UploadController : ControllerBase
{
    private static readonly string[] AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IImageStorageService imageStorageService, ILogger<UploadController> logger)
    {
        _imageStorageService = imageStorageService;
        _logger = logger;
    }

    [Authorize]
    [EnableRateLimiting("UploadLimit")]
    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadAsync(
        [FromForm] IFormFile file,
        [FromForm] string? folder,
        CancellationToken cancellationToken)
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

        // Basic content-type check
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (string.IsNullOrWhiteSpace(file.ContentType) || !allowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest("Invalid content type.");
        }

        // Inspect file header (magic bytes) to reduce risk of spoofed extensions
        await using var opened = file.OpenReadStream();
        var header = new byte[12];
        var read = await opened.ReadAsync(header.AsMemory(0, header.Length), cancellationToken);
        opened.Position = 0;

        if (!IsValidImageHeader(header, read))
        {
            return BadRequest("File content does not match an image type.");
        }

        var userUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "(unknown)";
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "(unknown)";
        _logger.LogInformation("Upload attempt by {User} from {Ip} filename={FileName} size={Size}", userUid, remoteIp, file.FileName, file.Length);

        var storedImage = await _imageStorageService.SaveImageAsync(file, folder, cancellationToken);
        return Ok(new { imageUrl = storedImage.ImageUrl, storagePath = storedImage.StoragePath });
    }

    // Only admin can delete stored images
    [Authorize(Policy = "IsAdmin")]
    [EnableRateLimiting("StrictAdminLimit")]
    [HttpDelete]
    public async Task<IActionResult> DeleteAsync([FromQuery] string path, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return BadRequest("Path is required.");
        }

        var userUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "(unknown)";
        var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "(unknown)";
        _logger.LogInformation("Delete request by {User} from {Ip} path={Path}", userUid, remoteIp, path);

        await _imageStorageService.DeleteImageAsync(path, cancellationToken);
        return NoContent();
    }

    private static bool IsValidImageHeader(byte[] header, int bytesRead)
    {
        if (bytesRead < 4)
            return false;

        // JPEG: 0xFF 0xD8 0xFF
        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
            return true;

        // PNG: 89 50 4E 47
        if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47)
            return true;

        // GIF: 'G','I','F','8'
        if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38)
            return true;

        // WebP: 'R','I','F','F' ... 'W','E','B','P' at offset 8
        if (bytesRead >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
            && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50)
            return true;

        return false;
    }
}

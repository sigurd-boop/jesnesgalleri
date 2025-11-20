using System.IO;
using System.Threading;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Galleri.Api.Services;

public class LocalImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly UploadSettings _settings;
    private readonly string _imagesRoot;

    public LocalImageStorageService(IWebHostEnvironment environment, IOptions<UploadSettings> options)
    {
        _environment = environment;
        _settings = options.Value;

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
            Directory.CreateDirectory(webRoot);
            _environment.WebRootPath = webRoot;
        }

        _imagesRoot = Path.Combine(webRoot, "images");
        Directory.CreateDirectory(_imagesRoot);
    }

    public async Task<ImageStorageResult> SaveImageAsync(
        IFormFile file,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File cannot be empty.", nameof(file));
        }

        var sanitizedFolder = NormalizeFolder(folder);
        var targetDirectory = string.IsNullOrWhiteSpace(sanitizedFolder)
            ? _imagesRoot
            : Path.Combine(_imagesRoot, sanitizedFolder);

        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var destinationPath = Path.Combine(targetDirectory, fileName);

        await using var stream = new FileStream(destinationPath, FileMode.Create);
        await file.CopyToAsync(stream, cancellationToken);

        var relativePath = string.IsNullOrWhiteSpace(sanitizedFolder)
            ? Path.Combine("images", fileName)
            : Path.Combine("images", sanitizedFolder, fileName);

        relativePath = relativePath.Replace("\\", "/");

        var publicUrl = string.IsNullOrWhiteSpace(_settings.PublicBaseUrl)
            ? $"/{relativePath}"
            : $"{_settings.PublicBaseUrl!.TrimEnd('/')}/{relativePath}";

        return new ImageStorageResult(publicUrl, relativePath);
    }

    public Task DeleteImageAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            return Task.CompletedTask;
        }

        var sanitized = storagePath.Replace("\\", "/").Trim().TrimStart('/');
        if (sanitized.Length == 0 || sanitized.Contains("..", StringComparison.Ordinal))
        {
            return Task.CompletedTask;
        }

        var absolutePath = Path.Combine(_environment.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"), sanitized);

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }

        return Task.CompletedTask;
    }

    private static string? NormalizeFolder(string? folder)
    {
        if (string.IsNullOrWhiteSpace(folder))
        {
            return null;
        }

        var sanitized = folder.Replace("\\", "/").Trim().Trim('/');
        if (sanitized.Length == 0 || sanitized.Contains("..", StringComparison.Ordinal))
        {
            return null;
        }

        return sanitized;
    }
}

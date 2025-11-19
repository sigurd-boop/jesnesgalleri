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

    public async Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File cannot be empty.", nameof(file));
        }

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var destinationPath = Path.Combine(_imagesRoot, fileName);

        await using var stream = new FileStream(destinationPath, FileMode.Create);
        await file.CopyToAsync(stream, cancellationToken);

        var relativePath = Path.Combine("images", fileName).Replace("\\", "/");

        if (!string.IsNullOrWhiteSpace(_settings.PublicBaseUrl))
        {
            return $"{_settings.PublicBaseUrl!.TrimEnd('/')}/{relativePath}";
        }

        return $"/{relativePath}";
    }
}

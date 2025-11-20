using System.Threading;
using Microsoft.AspNetCore.Http;

namespace Galleri.Api.Services;

public interface IImageStorageService
{
    Task<ImageStorageResult> SaveImageAsync(IFormFile file, string? folder = null, CancellationToken cancellationToken = default);

    Task DeleteImageAsync(string storagePath, CancellationToken cancellationToken = default);
}

public record ImageStorageResult(string ImageUrl, string StoragePath);

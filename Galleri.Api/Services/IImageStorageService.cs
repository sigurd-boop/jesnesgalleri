using System.Threading;
using Microsoft.AspNetCore.Http;

namespace Galleri.Api.Services;

public interface IImageStorageService
{
    Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default);
}

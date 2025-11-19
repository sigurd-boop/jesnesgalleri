using FirebaseAdmin.Auth;

namespace Galleri.Api.Services.Authentication;

public interface IFirebaseTokenValidator
{
    Task<FirebaseToken> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}

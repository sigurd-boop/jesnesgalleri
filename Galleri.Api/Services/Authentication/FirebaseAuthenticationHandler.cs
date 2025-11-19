using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace Galleri.Api.Services.Authentication;

public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IFirebaseTokenValidator _tokenValidator;

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock,
        IFirebaseTokenValidator tokenValidator) : base(options, logger, encoder, clock)
    {
        _tokenValidator = tokenValidator;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey(HeaderNames.Authorization))
        {
            return AuthenticateResult.NoResult();
        }

        var authorization = Request.Headers[HeaderNames.Authorization].ToString();
        if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.Fail("Authorization header is not using the Bearer scheme.");
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return AuthenticateResult.Fail("Bearer token is missing.");
        }

        try
        {
            var decodedToken = await _tokenValidator.ValidateAsync(token, Context.RequestAborted);
            var principal = BuildClaimsPrincipal(decodedToken);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (FirebaseAuthException ex)
        {
            Logger.LogWarning(ex, "Firebase token validation failed.");
            return AuthenticateResult.Fail("Invalid Firebase ID token.");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Unexpected error during Firebase authentication.");
            return AuthenticateResult.Fail("Authentication failure.");
        }
    }

    private static ClaimsPrincipal BuildClaimsPrincipal(FirebaseToken token)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, token.Uid),
            new("uid", token.Uid)
        };

        if (token.Claims.TryGetValue("email", out var emailObj) && emailObj is string email)
        {
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        if (token.Claims.TryGetValue("name", out var nameObj) && nameObj is string name)
        {
            claims.Add(new Claim(ClaimTypes.Name, name));
        }

        var identity = new ClaimsIdentity(claims, FirebaseAuthenticationDefaults.AuthenticationScheme);
        return new ClaimsPrincipal(identity);
    }
}

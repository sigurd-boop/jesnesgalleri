using System.IO;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Galleri.Api.Services;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace Galleri.Api.Services.Authentication;

public class FirebaseTokenValidator : IFirebaseTokenValidator
{
    private static readonly object SyncRoot = new();
    private readonly FirebaseSettings _settings;
    private readonly FirebaseApp _firebaseApp;

    public FirebaseTokenValidator(IOptions<FirebaseSettings> options)
    {
        _settings = options.Value;
        _firebaseApp = FirebaseApp.DefaultInstance ?? InitializeFirebaseApp();
    }

    private FirebaseApp InitializeFirebaseApp()
    {
        lock (SyncRoot)
        {
            if (FirebaseApp.DefaultInstance != null)
            {
                return FirebaseApp.DefaultInstance;
            }

            var credential = ResolveCredentials();

            var appOptions = new AppOptions
            {
                Credential = credential,
                ProjectId = string.IsNullOrWhiteSpace(_settings.ProjectId)
                    ? null
                    : _settings.ProjectId
            };

            return FirebaseApp.Create(appOptions);
        }
    }

    private GoogleCredential ResolveCredentials()
    {
        if (!string.IsNullOrWhiteSpace(_settings.ServiceAccountKeyPath) && File.Exists(_settings.ServiceAccountKeyPath))
        {
            return GoogleCredential.FromFile(_settings.ServiceAccountKeyPath);
        }

        if (!string.IsNullOrWhiteSpace(_settings.ServiceAccountKeyJson))
        {
            return GoogleCredential.FromJson(_settings.ServiceAccountKeyJson);
        }

        var envPath = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
        if (!string.IsNullOrWhiteSpace(envPath) && File.Exists(envPath))
        {
            return GoogleCredential.FromFile(envPath);
        }

        throw new InvalidOperationException("Firebase Admin SDK credentials are not configured. Provide Firebase:ServiceAccountKeyPath, Firebase:ServiceAccountKeyJson, or set GOOGLE_APPLICATION_CREDENTIALS.");
    }

    public async Task<FirebaseToken> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new ArgumentException("Token cannot be empty", nameof(idToken));
        }

        var auth = FirebaseAuth.GetAuth(_firebaseApp);
        return await auth.VerifyIdTokenAsync(idToken, cancellationToken);
    }
}

namespace Galleri.Api.Services;

public class FirebaseSettings
{
    public string ProjectId { get; set; } = string.Empty;

    public string? ServiceAccountKeyPath { get; set; }

    public string? ServiceAccountKeyJson { get; set; }
}

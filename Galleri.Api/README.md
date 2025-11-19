# Galleri Backend API

ASP.NET Core 8 Web API replacing Firebase Firestore/Storage while keeping Firebase Auth. Uses SQLite + EF Core and serves image uploads from `wwwroot/images`.

## Folder structure

```
Galleri.Api/
├── Controllers/
│   ├── ArtworksController.cs
│   └── UploadController.cs
├── Data/
│   └── AppDbContext.cs
├── DTOs/
│   └── CreateArtworkDto.cs
├── Migrations/
│   ├── 20240601000000_InitialCreate.cs
│   └── AppDbContextModelSnapshot.cs
├── Models/
│   └── Artwork.cs
├── Services/
│   ├── Authentication/
│   │   ├── FirebaseAuthenticationDefaults.cs
│   │   ├── FirebaseAuthenticationHandler.cs
│   │   ├── FirebaseTokenValidator.cs
│   │   └── IFirebaseTokenValidator.cs
│   ├── FirebaseSettings.cs
│   ├── IImageStorageService.cs
│   ├── LocalImageStorageService.cs
│   └── UploadSettings.cs
├── wwwroot/
│   └── images/
├── Program.cs
├── appsettings.json
├── Galleri.Api.csproj
└── README.md
```

## Configuration

1. **Firebase Admin SDK**
   - Download your Firebase service-account JSON to `Galleri.Api/Config/firebase-service-account.json` (or any path) and update `Firebase:ServiceAccountKeyPath` in `appsettings.json`. Alternatively, paste the JSON into `Firebase:ServiceAccountKeyJson` or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
   - Set `Firebase:ProjectId` to your Firebase project id.
2. **SQLite**
   - Default connection string writes `database.db` inside the project root. Adjust `ConnectionStrings:DefaultConnection` if you prefer another location.
3. **Image uploads**
   - Files land in `wwwroot/images`. `Upload:PublicBaseUrl` is used to build absolute URLs in responses (defaults to `http://localhost:5258`).
4. **CORS**
   - The policy currently allows `http://localhost:3000`. Add other origins via `Program.cs` / appsettings if needed.

## Running the API locally

```bash
cd Galleri.Api
dotnet restore
dotnet ef database update  # applies Migrations/20240601000000_InitialCreate.cs
DOTNET_ENVIRONMENT=Development dotnet run
```

The API listens on `http://localhost:5258` (configurable in `Properties/launchSettings.json`). Swagger UI is available at `/swagger` in Development.

## Creating new migrations

```bash
cd Galleri.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

`dotnet-ef` comes with the included EF Core Tools package. Install the CLI tool globally if prompted: `dotnet tool install --global dotnet-ef`.

## API overview

| Method | Route                  | Auth?     | Description                      |
|--------|-----------------------|-----------|----------------------------------|
| POST   | `/api/artworks`       | Firebase  | Create a new artwork row         |
| GET    | `/api/artworks`       | Optional  | List artworks (newest first)     |
| GET    | `/api/artworks/{id}`  | Optional  | Fetch single artwork             |
| DELETE | `/api/artworks/{id}`  | Firebase  | Remove an artwork                |
| POST   | `/api/upload-image`   | Firebase  | Uploads an image → returns URL   |

Send the Firebase ID token from the React app via `Authorization: Bearer <idToken>` header. The middleware validates it via `FirebaseAdmin` before your controller code runs.

## Deploying to a Linux VPS (Nginx + HTTPS)

1. **Publish** the app on your dev machine:
   ```bash
   dotnet publish Galleri.Api/Galleri.Api.csproj -c Release -o publish
   ```
2. **Copy** the `publish/` folder and `database.db` (or migrate on-server) to your VPS, e.g., via `scp` or GitHub Actions artifact.
3. **Systemd service** (on the VPS):
   ```ini
   [Unit]
   Description=Galleri API
   After=network.target

   [Service]
   WorkingDirectory=/var/www/galleri-api
   ExecStart=/usr/bin/dotnet /var/www/galleri-api/Galleri.Api.dll
   Restart=always
   Environment=ASPNETCORE_ENVIRONMENT=Production
   Environment=Firebase__ProjectId=your-firebase-project-id
   Environment=Firebase__ServiceAccountKeyPath=/var/www/galleri-api/firebase.json

   [Install]
   WantedBy=multi-user.target
   ```
   Reload systemd (`sudo systemctl daemon-reload`) and enable/start the service.
4. **Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name api.example.com;

       location / {
           proxy_pass         http://127.0.0.1:5258;
           proxy_http_version 1.1;
           proxy_set_header   Upgrade $http_upgrade;
           proxy_set_header   Connection keep-alive;
           proxy_set_header   Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header   X-Forwarded-Proto $scheme;
       }
   }
   ```
5. **HTTPS**: Point DNS to the VPS, then use Certbot to obtain a certificate (`sudo certbot --nginx -d api.example.com`). Certbot will rewrite the server block to redirect HTTP→HTTPS automatically.
6. **Persistence & migrations**: copy `database.db` or run `dotnet ef database update` on the server before starting the service. Mount `/wwwroot/images` to persistent storage if using local disks.

## Useful commands

- `dotnet run` & `dotnet watch run` – local dev
- `dotnet test` – (add later if needed)
- `dotnet ef migrations add` / `dotnet ef database update` – schema changes
- `rm wwwroot/images/*` – clear local uploads (development only)

## Troubleshooting

- **401 Unauthorized** → ensure the frontend sends a fresh Firebase ID token via `Authorization: Bearer <token>`.
- **Firebase credential error** → verify the service-account JSON path or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
- **SQLite locking** → use a single API instance per DB file or move to PostgreSQL/MySQL when deploying horizontally.

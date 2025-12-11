# Jesnes Galleri - AI Agent Instructions

## Architecture Overview

**Dual-repository monorepo**: Frontend (`jesnesgalleri/`) and Backend (`backend/Galleri.Api/`) are separate git repos in the same workspace.

**Frontend**: React 19 + TypeScript + Vite + Three.js for 3D gallery visualization. Uses Firebase Auth (client-side) for admin login only.

**Backend**: .NET 8 API with SQLite database. Validates Firebase JWT tokens but does NOT use Firebase Admin SDK for storage. Images stored in persistent `uploads/` directory.

**Deployment**: Ubuntu VPS with nginx reverse proxy. Frontend → `wwwroot/`, Backend → Kestrel on port 5000, Images → persistent `uploads/images/` served by nginx.

## Critical Architectural Decisions

### Image Storage Architecture (DO NOT BREAK THIS)
- **Images stored in**: `AppContext.BaseDirectory/uploads/images/` (NOT in wwwroot)
- **Why**: Frontend deployments use `rsync --delete` on wwwroot - this would wipe user uploads if images were in wwwroot
- **Nginx config**: `location ^~ /images/` serves from uploads directory with `^~` modifier for priority over regex patterns
- **See**: `backend/Galleri.Api/Services/LocalImageStorageService.cs` line 20-22

### Data Flow - Gallery Items
1. Backend API (`/api/artworks`) returns JSON with `imageUrl` (full HTTPS URLs) and `imageStoragePath` (relative paths)
2. Frontend `galleryRepository.ts` fetches via `apiClient.ts` which handles auth headers
3. **NO fallback data** - if API fails, show empty state (removed all dummy data in commit 9d03536)
4. `subscribeToGalleryItems()` pattern for reactive updates (not real-time, just fetch wrapper)

### Authentication Flow
- **Public endpoints**: `GET /api/artworks` (no auth required - intentional for public gallery)
- **Admin endpoints**: `POST/PUT/DELETE /api/artworks`, `POST /api/upload-image` require Firebase JWT
- **Frontend auth**: `AuthContext.tsx` wraps Firebase Auth, checks email against `VITE_FIREBASE_ADMIN_EMAILS` env var
- **Backend auth**: `Program.cs` line 47-58 - "IsAdmin" policy validates Firebase UID matches `Admin:Uid` in appsettings.json
- **Admin route**: Hidden at `/_atelier-admin`, protected by `RequireAdmin.tsx` component

## Development Workflows

### Frontend Development
```bash
npm run dev     # Vite dev server on :5173
npm run build   # TypeScript check + Vite build → dist/
```

### Backend Development
```bash
cd backend/Galleri.Api
dotnet run                    # Kestrel on :5000 (configurable in launchSettings.json)
dotnet ef migrations add Name # Create migration
dotnet ef database update     # Apply migrations
```

### Production Deployment (VPS at 72.62.51.200)

**Frontend**:
```bash
npm run build
rsync -avz --delete dist/ root@72.62.51.200:/var/www/min-app/server/publish/wwwroot/
```

**Backend**:
```bash
dotnet publish -c Release -o publish
rsync -avz --exclude='database.db*' --exclude='wwwroot' --exclude='uploads' publish/ root@72.62.51.200:/var/www/min-app/server/publish/
ssh root@72.62.51.200 'pkill -f Galleri.Api && cd /var/www/min-app/server/publish && nohup dotnet Galleri.Api.dll > /dev/null 2>&1 &'
```

**Critical**: Always exclude `uploads` directory from backend rsync to preserve user images.

## Project-Specific Conventions

### Component Patterns
- **3D components**: Use `@react-three/fiber` Canvas, always wrap in `<Suspense>` with fallback
- **Animation**: GSAP for scroll effects (`useGSAP` hook), Framer Motion for UI transitions
- **Styling**: Tailwind utility classes, custom `cn()` helper from `lib/cn.ts` for conditional classes
- **Loading states**: Three.js models use custom `loadingManager.ts` with progress tracking via `Pu` hook (see `ModelCanvas.tsx`)

### Backend Patterns
- **Rate limiting**: 200 req/min global, 20 req/min admin endpoints, 10 req/min uploads (see `Program.cs` line 80-110)
- **File validation**: Magic bytes check in `UploadController.cs` - validates actual file type, not just extension
- **Image naming**: GUIDs without hyphens (`{Guid.NewGuid():N}`) to avoid URL encoding issues
- **CORS**: Explicit origins whitelist in `Program.cs` - add new origins here, not wildcard

### State Management
- **No Redux/Zustand**: React Context for auth only (`AuthContext.tsx`)
- **Gallery state**: Local state in `Gallery.tsx`, infinite scroll with IntersectionObserver (commit ee18cda removed batch loading button)
- **Admin CRUD**: Direct API calls from `AdminDashboard.tsx`, optimistic UI updates after successful responses

### Naming Conventions
- **Gallery items**: Backend uses `Artwork` model, frontend uses `GalleryItem` type (mapped in `galleryRepository.ts`)
- **Categories**: `commercial`, `collection`, `studio` (defined as const array in `galleryRepository.ts` line 32)
- **Routes**: Frontend uses `/` (gallery), `/shop`, `/contact`, `/_atelier-admin` (hidden admin panel)

## Key Files Reference

- **Frontend entry**: `src/main.tsx` (React 19 setup with AuthProvider + Router)
- **API client**: `src/lib/apiClient.ts` (handles auth headers, base URL from env)
- **Gallery repo**: `src/lib/galleryRepository.ts` (API wrapper, type mapping, data sanitization)
- **Backend entry**: `backend/Galleri.Api/Program.cs` (DI, auth, CORS, rate limiting)
- **Image storage**: `backend/Galleri.Api/Services/LocalImageStorageService.cs` (persistent uploads directory)
- **Database context**: `backend/Galleri.Api/Data/AppDbContext.cs` (EF Core SQLite setup)

## Common Pitfalls

1. **DO NOT** add fallback/dummy data - gallery is 100% backend-driven (commit 9d03536 removed all fallbacks)
2. **DO NOT** store images in `wwwroot/images` - use `uploads/images` only (see architecture section)
3. **DO NOT** use `import.meta.env` in backend code - it's a Vite frontend feature, use `IConfiguration` in .NET
4. **DO NOT** add Firebase Admin SDK imports to frontend - frontend uses Firebase Client SDK only
5. **DO NOT** modify nginx `/images/` location block without understanding `^~` priority (prevents regex location conflicts)
6. **DO NOT** use conditional hooks (`if (condition) { useEffect(...) }`) - React Hooks must be at top level (fixed in commit resolving Context Lost errors)

## Environment Variables

**Frontend** (`.env.local`, gitignored):
- `VITE_FIREBASE_*` - Firebase client config (public keys, safe to expose)
- `VITE_API_BASE_URL` - Backend API URL (`https://jesne.art` in production)
- `VITE_FIREBASE_ADMIN_EMAILS` - Comma-separated admin email list for client-side UI checks

**Backend** (`appsettings.json`, committed except Production version):
- `Firebase:ProjectId` - For JWT validation only
- `Admin:Uid` - Firebase UID for admin authorization policy
- `ConnectionStrings:DefaultConnection` - SQLite DB path (`Data Source=database.db`)
- `Upload:PublicBaseUrl` - Used to construct full image URLs in responses

## Security Notes

- Firebase service account JSON is NOT used (was removed, commit af8fe61)
- Backend validates Firebase JWT tokens via public keys (no private keys needed)
- Rate limiting enforced at application level (ASP.NET middleware)
- CORS restricted to specific origins - no `Access-Control-Allow-Origin: *`
- Images directory excluded from git (`.gitignore` includes `wwwroot/images/*` and `uploads/*`)
- Admin UID stored in config, not hardcoded - change via environment variable in production

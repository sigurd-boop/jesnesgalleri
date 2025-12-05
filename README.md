# Jesnes Galleri - Professional 3D Gallery Platform

A premium, production-ready 3D gallery platform built for showcasing artwork and design work. Built with React, TypeScript, Tailwind CSS on the frontend and ASP.NET Core 8 with SQLite on the backend. Features secure admin authentication, rate limiting, and a clean separation of concerns.

## Project Overview

**Frontend**: React 19 + TypeScript with Vite, featuring 3D model visualization with Three.js, responsive masonry gallery layout, and GSAP animations.

**Backend**: ASP.NET Core 8 REST API with Firebase JWT authentication, role-based authorization, comprehensive rate limiting, and SQLite persistence.

**Security**: Firebase JWT token validation, admin-only authorization policy, magic-bytes file validation, rate limiting (200 req/min global, 20 req/min admin, 10 req/min uploads), security headers, and CORS protection.

## Quick Start

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173)

### Backend

```bash
# From backend/Galleri.Api directory
cd backend/Galleri.Api

# Run database migrations
dotnet ef database update

# Start API server
dotnet run
```

API runs on `http://localhost:5258` by default.

## Environment Setup

### Frontend (.env.local)

```bash
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# API Configuration
VITE_API_BASE_URL="http://localhost:5258"

# Admin Configuration
VITE_FIREBASE_ADMIN_EMAILS="admin@example.com"
VITE_ADMIN_ROUTE="_atelier-admin"
```

### Backend (appsettings.json / Environment Variables)

```json
{
  "Firebase": {
    "ProjectId": "your-project-id"
  },
  "Admin": {
    "Uid": "your-firebase-uid"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=gallery.db"
  },
  "Upload": {
    "StorageDir": "wwwroot/uploads",
    "MaxFileSizeBytes": 10485760
  }
}
```

## Features

### Frontend
- ✅ Responsive 3D gallery with GLB model support
- ✅ Masonry layout with GSAP animations
- ✅ Secure Firebase authentication
- ✅ Admin dashboard for managing artwork
- ✅ Image upload with progress tracking
- ✅ Mobile-optimized UI
- ✅ Real-time gallery item refresh

### Backend
- ✅ Firebase JWT authentication
- ✅ Admin-only authorization policy
- ✅ Rate limiting (configurable per endpoint)
- ✅ Magic-bytes file validation (JPEG, PNG, GIF, WebP)
- ✅ Path traversal protection
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ Comprehensive logging
- ✅ EF Core migrations
- ✅ CORS configuration for frontend origins

## Project Structure

### Frontend
```
src/
├── pages/
│   ├── Gallery.tsx          # Main gallery page
│   ├── AdminDashboard.tsx   # Admin management interface
│   ├── Login.tsx            # Admin login
│   ├── Contact.tsx          # Contact page
│   └── Github.tsx           # Repository link
├── components/
│   ├── ModelCanvas.tsx      # 3D model viewer (React Three Fiber)
│   ├── Masonry.tsx          # Gallery layout with animations
│   └── [other components]
├── context/
│   └── AuthContext.tsx      # Firebase auth management
├── lib/
│   ├── apiClient.ts         # HTTP client with auth
│   ├── galleryRepository.ts # API integration layer
│   ├── firebase.ts          # Firebase configuration
│   └── [utilities]
└── hooks/
    └── [custom React hooks]
```

### Backend
```
Galleri.Api/
├── Program.cs               # ASP.NET configuration
├── Controllers/
│   ├── ArtworksController.cs
│   └── UploadController.cs
├── Models/
│   └── Artwork.cs
├── DTOs/
│   └── CreateArtworkDto.cs
├── Services/
│   ├── IImageStorageService.cs
│   └── LocalImageStorageService.cs
├── Data/
│   ├── AppDbContext.cs
│   └── Migrations/
└── Properties/
    └── launchSettings.json
```

## Deployment

### Frontend Deployment
```bash
# Build production bundle
npm run build

# Deploy dist/ folder to hosting platform (Vercel, Netlify, etc.)
```

### Backend Deployment
```bash
# Build release bundle
dotnet publish -c Release -o ./publish

# Deploy to hosting platform (Azure, Docker, etc.)
```

**Important**: 
- Update `VITE_API_BASE_URL` to your production API URL
- Set `Admin:Uid` in backend configuration to your Firebase UID
- Update CORS origins in `Program.cs` to production domain
- Use environment variables for sensitive configuration

## API Endpoints

### Public Endpoints
- `GET /api/artworks` - Get all gallery items
- `GET /api/artworks/{id}` - Get specific item

### Admin-Only Endpoints (Requires Firebase JWT + Admin UID)
- `POST /api/artworks` - Create new artwork
- `PUT /api/artworks/{id}` - Update artwork
- `DELETE /api/artworks/{id}` - Delete artwork
- `POST /api/upload-image` - Upload image
- `DELETE /api/upload-image` - Delete image

## Security Considerations

✅ **Implemented**:
- JWT token validation with issuer/audience/expiry checks
- Admin authorization policy (NameIdentifier claim matching)
- Rate limiting on all sensitive endpoints
- Magic-bytes file validation (prevents spoofed file extensions)
- Path traversal protection
- Security headers (4 types)
- CORS restricted to configured origins
- Environment variables for secrets
- No credentials in production build

## Troubleshooting

**503 Admin Forbidden**:
- Verify `Admin:Uid` in backend `appsettings.json` matches Firebase UID
- Check Firebase JWT token is valid and not expired

**Upload fails (413)**:
- Verify image file size < 10MB
- Check file format is supported (JPEG, PNG, GIF, WebP)
- Confirm Content-Type header is correct

**CORS errors**:
- Ensure frontend URL is added to `FrontendPolicy` in `Program.cs`
- Check `VITE_API_BASE_URL` matches actual backend URL

## Technology Stack

**Frontend**:
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Three.js + React Three Fiber (3D rendering)
- GSAP (animations)
- Firebase SDK (authentication)

**Backend**:
- .NET 8 / ASP.NET Core 8
- Entity Framework Core (ORM)
- SQLite (database)
- Firebase Admin SDK (JWT validation)

## Development

All code is production-ready with:
- ✅ TypeScript strict mode
- ✅ Comprehensive error handling
- ✅ Input validation & sanitization
- ✅ Async/await patterns
- ✅ Clean code principles
- ✅ Security best practices
- ✅ Performance optimization

## License & Notes

This is a private gallery platform. Keep the admin route secret and secure your Firebase credentials.

---

**Last Updated**: November 30, 2025  
**Status**: Ready for production deployment

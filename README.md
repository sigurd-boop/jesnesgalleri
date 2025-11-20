# Jesnes Galleri

En sømløs og stilren 3D-opplevelse bygget med React, TypeScript og Tailwind CSS. Prosjektet viser frem GLB-modeller som
roterer rolig i 360° og leverer en rolig, eksklusiv galleriopplevelse. En innebygget, skjult adminflate bruker Firebase
Authentication for pålogging og snakker med et ASP.NET Core-backend-API for persistering i SQLite.

## Status

Chrome-logoen er nå låst til den faste størrelsesoppsettet vi testet tidligere, og header-spinneren ser riktig ut på
både mobil og desktop. Denne README-endringen gjør det enkelt å pushe dagens versjon til en egen branch.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173) for å se galleriet under utvikling.

## Legg inn dine egne GLB-modeller

1. Plasser filene dine i `public/models`.
2. Oppdater filbanene via admin-panelet (se avsnittet **Skjult admin-tilgang**) eller legg dem manuelt inn i databasen
   via backend-API-et (`/api/artworks`).
3. Velg kategori (`commercial` for kommersielle jobber eller `collection` for studio-kolleksjonen) slik at innholdet havner
   i riktig fane. Modellen lastes i et WebGL-lerret og roterer automatisk. Hvis du legger til et bilde/preview-URL vises det
   som et komplementært stillbilde i galleriet.

## Miljøvariabler og backend

1. Opprett et Firebase-prosjekt og aktiver **Email/Password** i Authentication (kun Auth beholdes).
2. Kjør backend-API-et fra `backend/Galleri.Api` (se backend-README for `dotnet run`, migreringer osv.). Standard URL er
   `http://localhost:5258`.
3. Lag en `.env.local` med følgende nøkler (verdier finner du i Firebase-konsollen):

   ```bash
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   VITE_API_BASE_URL="http://localhost:5258"
   # Komma-separerte admin-adresser som skal ha full tilgang til admin-panelet
   VITE_FIREBASE_ADMIN_EMAILS="admin@example.com"
   # Sett en hemmelig slug for admin-routing. Standard er `_atelier-admin` hvis feltet utelates.
   VITE_ADMIN_ROUTE="min-skjulte-rute"
   ```

4. Etter innlogging kan du legge til, oppdatere og slette gallerielementer (tittel, beskrivelse, kategori, GLB-filbane,
   valgfritt bilde) direkte fra admin-siden. Alle CRUD-kall sendes til backend-API-et, og bildene lastes opp via
   `/api/upload-image`.

## Skjult admin-tilgang

- Admin-dashboardet eksponeres på `/${VITE_ADMIN_ROUTE}` (standard `/_atelier-admin`). Oppdater miljøvariabelen før
  produksjonsutrulling slik at stien blir vanskelig å gjette.
- Innloggingssiden ligger på samme slug med `/login`-suffiks.
- Ingen lenker i UI peker til adminruten; skriv URL-en manuelt eller lagre den som et bokmerke.
- Tilgangen begrenses av e-postene definert i `VITE_FIREBASE_ADMIN_EMAILS`.

## Struktur

- `src/pages/Gallery.tsx` – hovedgalleri med 3D-visning, kategorifaner og strøm fra backend-API-et.
- `src/pages/Contact.tsx` – kontaktinformasjon og CTA.
- `src/pages/Github.tsx` – lenke til repository og forslag til videre arbeid.
- `src/pages/AdminDashboard.tsx` – skjult adminflate for CRUD på galleriet, inkludert kategorifelt.
- `src/pages/Login.tsx` – sikker innlogging for administratorer.
- `src/components/ModelCanvas.tsx` – kapsler inn `<Canvas>` fra `@react-three/fiber` og håndterer lastelogikk.
- `src/context/AuthContext.tsx` – enkel wrapper rundt Firebase Authentication.
- `src/lib/galleryRepository.ts` – wrapper rundt backend-API-et for CRUD på galleriet.

## Teknologi

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) + [drei](https://github.com/pmndrs/drei)

Prosjektet er konfigurert med `allowJs`, så du kan blande TypeScript- og JavaScript-filer ved behov.

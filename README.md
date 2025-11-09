# Jesnes Galleri

En sømløs og stilren 3D-opplevelse bygget med React, TypeScript og Tailwind CSS. Prosjektet viser frem GLB-modeller som
roterer rolig i 360° og leverer en rolig, eksklusiv galleriopplevelse. En innebygget adminflate med Firebase-tilkobling lar
deg logge inn, redigere og publisere verk direkte fra nettleseren.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173) for å se galleriet under utvikling.

## Legg inn dine egne GLB-modeller

1. Plasser filene dine i `public/models`.
2. Oppdater filbanene via admin-panelet (`/admin`) eller endre standardlisten i Firestore-kolleksjonen `galleryItems`.
3. Modellen lastes i et WebGL-lerret og roterer automatisk. Hvis du legger til et bilde/preview-URL vises det som et
   komplementært stillbilde i galleriet.

## Firebase-oppsett

1. Opprett et Firebase-prosjekt og aktiver **Email/Password** i Authentication.
2. Opprett en Firestore-database i **Production**-modus (eller test etter behov) og legg til samlingen `galleryItems`.
3. Lag en `.env.local` med følgende nøkler (verdier finner du i Firebase-konsollen):

   ```bash
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   # Komma-separerte admin-adresser som skal ha full tilgang til admin-panelet
   VITE_FIREBASE_ADMIN_EMAILS="admin@example.com"
   ```

4. Installer Firebase-avhengigheten og bygg prosjektet:

   ```bash
   npm install firebase
   npm run build
   ```

5. Etter innlogging kan du legge til, oppdatere og slette gallerielementer (tittel, beskrivelse, GLB-filbane, valgfritt
   bilde) direkte fra admin-siden.

## Struktur

- `src/pages/Gallery.tsx` – hovedgalleri med 3D-visning og Firestore-strøm.
- `src/pages/Contact.tsx` – kontaktinformasjon og CTA.
- `src/pages/Github.tsx` – lenke til repository og forslag til videre arbeid.
- `src/pages/AdminDashboard.tsx` – adminflate for CRUD på galleriet.
- `src/pages/Login.tsx` – sikker innlogging for administratorer.
- `src/components/ModelCanvas.tsx` – kapsler inn `<Canvas>` fra `@react-three/fiber` og håndterer lastelogikk.
- `src/context/AuthContext.tsx` – enkel wrapper rundt Firebase Authentication.
- `src/lib/galleryRepository.ts` – Firestore-abstraksjon for CRUD.

## Teknologi

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) + [drei](https://github.com/pmndrs/drei)

Prosjektet er konfigurert med `allowJs`, så du kan blande TypeScript- og JavaScript-filer ved behov.

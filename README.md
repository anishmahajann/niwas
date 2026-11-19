# Niwas

Niwas is a trust-first Indian real-estate marketplace prototype. Listings show what was verified, when it was checked, and which details or documents still need review.

## Run locally

```sh
npm install
copy .env.example .env
npm run seed
npm run dev:all
```

Run MongoDB locally first (the default URI is `mongodb://127.0.0.1:27017/niwas`). Create a Firebase project, enable Email/Password and Google providers in Firebase Authentication, add the web app settings to the `VITE_FIREBASE_*` variables in `.env`, and configure the Admin SDK using `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (or Application Default Credentials). Add administrator email addresses to `ADMIN_EMAILS`. Never commit service-account credentials or paste the private key into source code.

Firebase Authentication owns password and Google sign-in. The browser sends a verified Firebase ID token to the API as a Bearer token; the API verifies it with Firebase Admin, creates/updates a MongoDB user profile, and applies the server-controlled role from `ADMIN_EMAILS`. Passwords go directly to Firebase and are never received by the API or stored in MongoDB.

The web app runs at `http://localhost:5173` and the API at `http://localhost:4000`. The web app proxies `/api` and `/uploads` to the API. Run `npm run server` to start only the API, or `npm run dev` to start only the frontend. The frontend keeps demo listings available if the API is offline; account, saved-home, report, admin, and upload actions require the API and MongoDB.

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run server` — start the Express API
- `npm run dev:all` — start the API and Vite together
- `npm run seed` — upsert the sample listings into MongoDB
- `npm start` — start the API for production
- `npm run build` — create a production build in `dist`
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Prototype routes

- `/` — search, popular locations, trust pillars, and featured listings
- `/search` — client-side filters, sorting, property cards, and an OpenStreetMap view
- `/property/:id` — listing details, verification evidence and timeline, documents, location, and reports
- `/saved` — saved listings, notes, and side-by-side comparison
- `/post` — multi-step property submission prototype
- `/admin` — dashboard, listings, verification queue, document review, reports, users, and audit history

Listings, accounts, saved homes and notes, reports, admin review actions, and uploaded files are backed by MongoDB and the Express API. Uploaded images and documents are stored under `UPLOAD_DIR` (local disk by default); use persistent storage and HTTPS for deployment. Maps use Leaflet and OpenStreetMap tiles.

## Backend structure

```text
server/
  config/       MongoDB and Firebase Admin initialization
  controllers/  HTTP request handlers
  middleware/   Firebase token verification and role authorization
  models/       MongoDB user model
  models.js     Property, report, and verification-history models
  routes/       Authentication routes
  services/     Firebase-to-MongoDB account synchronization
  app.js        Express middleware and API registration
  index.js      Startup and graceful shutdown
src/
  config/       Firebase browser SDK initialization
  api/          Authenticated API client
  components/   Login/signup UI
```

Email signup sends a verification email; users must verify before the API accepts their Firebase ID token. `GET /api/auth/me` synchronizes the Firebase identity with its MongoDB profile. All protected routes use the same Firebase token middleware, and admin permissions are derived from `ADMIN_EMAILS`.

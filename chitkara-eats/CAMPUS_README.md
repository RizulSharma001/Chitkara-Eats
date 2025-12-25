# Campus Eats — Campus Integration Notes

This file documents the minimal data models, context/state structure, and integration notes added to convert the app into a campus-scoped, multi-campus-ready system without changing UI or visuals.

- Data models:
  - `CAMPUSES` (in `src/data/campuses.js`): array of campus objects with fields:
    - `campusId` (string): canonical id (e.g. `punjab`).
    - `campusName` (string): display name (e.g. `Punjab`).
    - `universityName`, `city`, `state`, `logo` (optional), `theme` (future-ready).
    - `sourceKey`: keeps compatibility with existing `src/data/campus.js` (values: `Punjab`/`Himachal`).

- Context/state:
  - `CampusProvider` (`src/context/CampusContext.jsx`) exposes:
    - `campuses`: list of available campuses
    - `selectedCampus`: currently selected campus object
    - `selectCampusById(campusId)`: switch campus (persists selection)
    - `getOutlets()`: convenience wrapper returning outlets for selected campus

- Frontend integration:
  - `CampusProvider` is mounted at the app root (`src/main.jsx`) so all pages can consume campus state.
  - The existing dropdown in `Home.jsx` now uses `useCampus()` and the list is derived from `CAMPUSES`.
  - `src/data/campus.js` (legacy helpers) are left intact and still power outlet queries; `CampusProvider` persists selection into the legacy localStorage format for backwards compatibility.

- Typing animation:
  - `src/components/TypingBanner.jsx` implements a three-line typewriter effect and is added above the search bar in `Home.jsx`.

- Backend-ready notes:
  - On the backend, implement a `Campus` table/collection with the fields described above and expose endpoints like:
    - `GET /api/campuses` — list campuses
    - `GET /api/campuses/:campusId/outlets` — outlets scoped to campus
    - `POST /api/campuses` — create campus (admin)
  - Frontend should later fetch campuses instead of importing `CAMPUSES` static list.

- How to test locally:
  - Run frontend: `npm --prefix chitkara-eats run dev` (or from workspace root: `npm run dev:frontend`).
  - The campus dropdown in the search card will persist selection in localStorage and filter outlets accordingly.

If you want, I can next:
- Replace the static `CAMPUSES` with a fetch from `/api/campuses` and add a tiny mock backend route.
- Add admin pages for campus/outlet/menu management.

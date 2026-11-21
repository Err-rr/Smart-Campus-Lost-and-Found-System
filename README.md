# Smart Campus Lost and Found System

A demo web portal for the Delhi Technological University (DTU) campus lost and found process, built for a Software Engineering case study.

Students and staff report lost or found items. A matching engine suggests likely pairs and explains each score. Owners claim items by describing details only they would know. Desk staff check those details against hidden records and record a verified handover. Administrators see recovery figures and manage users, categories and settings.

> **This is a demo.** There is no backend, no real Campus SSO and no real email or SMS. All data is mock data stored in your browser's `localStorage`. Clearing site data, or using **Admin > Settings > Reset demo data**, restores the original sample data.

## Demo roles

Open the site and choose a role under **Demo mode: choose a role** on the sign-in page. To switch roles, click **Sign out** in the navbar and pick another one.

| Role | Signs in as | Starts on | Pages |
| --- | --- | --- | --- |
| Student | Shivam Kumar, 24/ME/265 | Home | Home, Lost Items, Found Items, Report, My Reports |
| Faculty or Staff | Dr. Meera Iyer | Home | Same as Student (both are campus users) |
| Desk Staff | Sunil Kumar | Desk | Desk, Found Items, Lost Items |
| Administrator | Kavita Rao | Dashboard | Dashboard, Desk, Found Items, Lost Items |

Pages outside a role are hidden from its menu and blocked if opened directly.

The student account starts with a strong match waiting (LR-0001 with FI-0003) and a claim under review (CL-0002). The desk starts with 4 claims to verify and 2 approved items waiting for handover, so every flow can be shown straight away.

## Main features

- **Report** lost or found items with a compressed photo (kept under 1 MB).
- **Matching engine** (`lib/matching.ts`): same category is required (40 points), same location (20), found 0 to 2 days after the loss (20) or 3 to 7 days (10), and keyword overlap by Jaccard similarity (up to 20). A match is suggested at or above the threshold (default 60). Hidden identifying details are never used.
- **Privacy**: campus users never see owner contact details or the hidden identifying details that the desk uses to verify a claim.
- **Claims** with a step tracker, and notifications shown in the navbar bell (email and SMS are simulated).
- **Desk Console**: log handed-in items, review claims side by side with the hidden details, confirm handovers after an ID check, and keep a custody register with unclaimed flags.
- **Admin Dashboard**: overview figures and charts, user roles, categories, audit log and settings.

## Run locally

Requirements: Node.js 18.17 or later (20 LTS recommended).

```bash
git clone -b development https://github.com/Err-rr/Smart-Campus-Lost-and-Found-System.git
cd Smart-Campus-Lost-and-Found-System
npm install
npm run dev
```

Then open http://localhost:3000.

Production build:

```bash
npm run build
npm start
```

## Tech stack

- Next.js 14 (App Router) with TypeScript
- Tailwind CSS with a small set of hand-built components in `components/ui`
- Zustand with the persist middleware (browser `localStorage`)
- lucide-react icons
- Recharts for the admin charts
- Inter and JetBrains Mono through `next/font`

## Project layout

```
app/                 Routes. (campus) holds the signed-in pages, login is separate
components/ui/       Buttons, cards, pills, forms, tables, dialogs
components/<area>/   Page views: home, report, found, my-reports, desk, admin
lib/types.ts         Data model, following the ER diagram
lib/seed.ts          Sample users, reports, items, matches and claims
lib/matching.ts      Matching engine
lib/store.ts         Zustand store and all actions
```

## Item photos

Sample item photos are in `public/items/`. They come from Wikimedia Commons under CC0, public domain, CC BY and CC BY-SA licences. Authors, licences and source links are listed in [public/items/CREDITS.md](public/items/CREDITS.md). Keep that file if you reuse the photos.

## Logo

Place the DTU logo at `public/dtu-logo.png` (square PNG, transparent background). It is used in the navbar, on the sign-in page and as the favicon. If the file is missing, a neutral circle is shown instead.

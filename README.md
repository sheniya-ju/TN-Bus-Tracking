# TN Govt Bus Tracking — Website

This repository is a beginner-friendly website to track government buses (passenger, driver, admin roles) using Firebase (Auth + Firestore) and Leaflet/OpenStreetMap.

## Folder structure
See `bus-tracking-website/` root.

## Setup steps (quick)
1. Create Firebase project at https://console.firebase.google.com
2. Enable **Authentication -> Email/Password**
3. Enable **Firestore** (Native mode)
4. Copy your Firebase web config from Project Settings -> SDK config
5. Open `src/js/firebase-config.js` and replace placeholders with your config values
6. (Optional) adjust Firestore rules (recommended sample in earlier instructions)
7. Run locally:
   - Option A (Quick): Install Live Server (`npm i`) and run `npm start` then open `http://127.0.0.1:5500/public/index.html`
   - Option B (Recommended): Use Firebase Hosting
     - Install Firebase CLI: `npm i -g firebase-tools`
     - `firebase login`
     - `firebase init` -> choose Hosting (public folder = `public`)
     - `firebase deploy --only hosting`

## How to test
1. Open `public/index.html` -> Signup -> create a user, driver and admin.
2. Login as driver -> driver panel -> click **Start Sharing** (allow geolocation)
3. Login as user -> user panel -> see bus markers update in realtime and submit complaints
4. Login as admin -> assign drivers to buses, view complaints and resolve them

## Notes
- Replace Firebase config placeholders before running.
- Browsers require **HTTPS** for geolocation; Firebase Hosting provides HTTPS.
- For production, tighten Firestore security rules.

## Files provided
All HTML, CSS and JS files under `public/` and `src/`.

If you want, I can:
- Export this as a ready-to-download ZIP,
- Add sample Firestore rules,
- Convert maps to Google Maps (requires API & billing),
- Add unit tests or CI scripts.
 <img src="C:/TN Bus Tracking Website/image.jpeg" alt="TN Govt Transport Logo" class="logo">

 .logo { display:block; margin:0 auto 15px auto; width:200px; height:auto; border-radius:10px; object-fit:cover; }
    input, select { width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #81c784; font-size:1rem; }
    button { width:100%; padding:10px; border:none; border-radius:8px; background-color:#388e3c; color:white; font-weight:bold; cursor:pointer; }
    button:hover { background-color:#2e7d32; }
    .error { color:#d32f2f; margin-top:6px; text-align:center; }
    .small { font-size:0.9rem; text-align:center; }
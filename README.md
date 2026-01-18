# qrscan-queue-fe

Frontend for QR queue system.

## Target
- React + Vite + TypeScript
- TailwindCSS
- Routing: react-router
- Realtime: @microsoft/signalr

## Scaffold (run on a machine where npm works)

```powershell
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom @microsoft/signalr
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Required routes / pages

1) Customer landing (after QR)
- `/s/:siteSlug/r/:roomSlug`
- Show: room, current number, next number, 10 min/turn
- Actions:
	- Take number
	- Optional login for points (phone + DOB) / skip

2) My ticket tracking
- `/s/:siteSlug/r/:roomSlug/mine?ticketId=...`
- Show: my number, ahead count, estimated remaining minutes
- Show: current time + estimated serve time (HH:mm), realtime updates

3) Staff controller
- `/staff/s/:siteSlug/r/:roomSlug`
- Buttons: call next / complete / skip

4) TV overview
- `/tv/s/:siteSlug`
- Show 5 rooms (current/next/ETA), realtime updates

## Backend integration

Configure API base URL via env:
- `VITE_API_BASE_URL=https://<render-backend-host>`

SignalR hub is at:
- `${VITE_API_BASE_URL}/hubs/queue`

Frontend should call:
- `JoinSite(siteSlug)` for TV
- `JoinRoom(siteSlug, roomSlug)` for customer + staff

Events:
- `roomUpdated` -> payload matches backend `GET /api/public/sites/{siteSlug}/rooms/{roomSlug}/status`
- `siteUpdated` -> payload matches backend `GET /api/tv/sites/{siteSlug}/status`

## Feedback flow
- After completion, show 1–5 stars + optional comment
- Include a "More" button that opens a global external link (configured in frontend)
- Submit feedback to backend: `POST /api/public/tickets/{ticketId}/feedback`

## Deploy (Netlify)

Expected settings:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing: add Netlify redirect rule (to be added when Vite scaffold exists)

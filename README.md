# The Fitness Garage – MERN + Next.js (concept draft)

- `client/` – Next.js 14 (App Router) website, server-rendered, with local-SEO JSON-LD
- `server/` – Express + MongoDB (Mongoose) API for enquiries, plans and trainers

## Run locally
```bash
# 1. API
cd server && cp .env.example .env     # set MONGODB_URI and a long random ADMIN_TOKEN
npm install && npm run seed && npm run dev

# 2. Website (new terminal)
cd client && cp .env.example .env.local
npm install && npm run dev            # http://localhost:3000
```
Enquiries from the form are saved to MongoDB. View them at `/admin` using your ADMIN_TOKEN.
If the API is down, the site still renders using built-in default content.

## Edit prices and trainers (admin API, send header `x-admin-token`)
- `PUT /api/admin/plans/:id` with `{ "price": "₹…" }`
- `POST /api/admin/trainers` with `{ "name", "bio", "photoUrl" }`

## Before going live
- Replace placeholders (photos, prices, map embed) with the gym's confirmed information.
- Remove the "concept draft" banner and footer note only with the gym's approval.
- Deploy: client on Vercel, API on Render/Railway, database on MongoDB Atlas.
  Set `CLIENT_ORIGIN` (API) and `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL` (client).
# fitness-garage

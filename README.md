# Ugly Food Intelligence Network (U-FIN)

## Overview
Full-stack app for redistributing imperfect agricultural produce. Includes farmer, buyer, NGO, admin roles, classification, matching, impact tracking, and dashboard.

## Folder structure
- `/server`: Node.js + Express backend
  - `/models`: Mongoose schemas (`User`, `Produce`, `Request`, `Transaction`)
  - `/routes`: API routes (`auth`, `produce`, `dashboard`)
  - `/controllers`: business logic
  - `/services`: classification/matching/auth
- `/client`: React + Vite + Tailwind frontend

## Setup
### Backend
1. `cd C:\Users\Public\ufin\server`
2. `npm install`
3. copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`
4. `npm run dev`

### Frontend
1. `cd C:\Users\Public\ufin\client`
2. `npm install`
3. `npm run dev`

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/produce/add`
- `GET /api/produce/all`
- `GET /api/produce/mine`
- `POST /api/produce/match`
- `GET /api/dashboard/stats`

## Notes
- Authentication uses JWT.
- Produce is auto-classified using the rule-based engine.
- Basic matching and impact tracking implemented.
- Frontend has basic dashboard and produce form.

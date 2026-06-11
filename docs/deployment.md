# Deployment Guide

## Architecture

| Component | Platform | URL Pattern              |
|-----------|----------|--------------------------|
| Frontend  | Vercel   | `https://your-app.vercel.app` |
| Backend   | Render   | `https://your-api.onrender.com` |
| Database  | Neon     | PostgreSQL connection string |

---

## 1. Database — Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (e.g. `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Run the schema manually or let the backend auto-migrate on startup:

```bash
psql "<your-neon-connection-string>" -f backend/database/schema.sql
```

---

## 2. Backend — Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Environment variables:

| Variable       | Value                              |
|----------------|------------------------------------|
| DATABASE_URL   | Neon connection string             |
| JWT_SECRET     | Strong random secret               |
| NODE_ENV       | production                         |
| PORT           | 5000                               |
| SEED_DATA      | false (or true for demo data)      |

5. Deploy and note the service URL (e.g. `https://doctor-api.onrender.com`)

---

## 3. Frontend — Vercel

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment variable:

| Variable       | Value                              |
|----------------|------------------------------------|
| VITE_API_URL   | `https://doctor-api.onrender.com`  |

4. Deploy

---

## 4. Docker (Self-Hosted)

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

---

## Post-Deployment Checklist

- [ ] Backend health check: `GET /api/health` returns `{ "status": "ok" }`
- [ ] Frontend loads and can reach the API
- [ ] CORS allows the Vercel domain (backend uses open CORS by default)
- [ ] JWT_SECRET is set to a strong value in production
- [ ] Database SSL is enabled (Neon requires it; pool config handles this)
- [ ] Test registration, login, booking flow end-to-end

---

## Environment Variables Reference

### Backend

| Variable     | Required | Description                    |
|--------------|----------|--------------------------------|
| DATABASE_URL | Yes      | PostgreSQL connection string   |
| JWT_SECRET   | Yes      | Secret for signing JWTs        |
| PORT         | No       | Server port (default: 5000)    |
| NODE_ENV     | No       | `development` or `production`|
| SEED_DATA    | No       | `true` to seed demo accounts   |

### Frontend

| Variable     | Required | Description                    |
|--------------|----------|--------------------------------|
| VITE_API_URL | Yes      | Backend API base URL           |

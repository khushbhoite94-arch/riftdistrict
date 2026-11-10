# RIFT DISTRICT

Luxury streetwear ecommerce — full-stack Next.js app.

## Quick start

```bash
cd ~/Downloads/khush
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

Copy `.env.example` to `.env.local` and set:

- `SQLSERVER_HOST` / `SQLSERVER_PORT` / `SQLSERVER_DB` / `SQLSERVER_USER` / `SQLSERVER_PASSWORD` — Microsoft SQL Server connection
- `JWT_SECRET` — random secret for auth
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

## Set up database

Create the SQL Server schema:

```bash
npm run sql:setup
```

**Admin access:** Create or provision an administrator account through a trusted, private setup process. Never commit administrator credentials to the repository.

## Brand colors

| Token | Hex |
|-------|-----|
| Base | `#1A2730` |
| Surface | `#424048` |
| Slate | `#45586C` |
| Mist | `#B0CEE2` |
| Rust | `#A63E1B` |
| Orange | `#E95D2C` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run sql:setup` | Create the SQL Server schema |
| `npm run sql:smoke` | Smoke-test the SQL connection |

# Jericho Website

The web frontend for the Jericho cyber-physical training platform. Built with Next.js 16, Tailwind v4, DaisyUI v5, better-auth, and Prisma (PostgreSQL).

Full documentation lives in [`docs/`](./docs/) and is served at `/docs` on a running instance.

---

## Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL 14+
- Proxmox VE instance (for VM management features)
- Optional: Microsoft Entra ID app registration (for OAuth sign-in)

---

## Development Setup

```bash
bun install
cp .env.example .env   # then fill in your values
bunx prisma migrate deploy
bun run dev
```

The app runs at `http://localhost:3000`.

### Minimum required environment variables

```env
BETTER_AUTH_SECRET="<random-secret>"
BETTER_AUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/jericho"
```

See [`docs/reference/environment-variables.mdx`](./docs/reference/environment-variables.mdx) for the full list.

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server (port 3000) |
| `bun run lint` | Run ESLint |
| `bunx prisma studio` | Open Prisma database GUI |
| `bunx prisma migrate dev` | Create and apply a new migration |
| `bunx prisma migrate deploy` | Apply pending migrations (CI/prod) |

---

## Nginx Reverse Proxy (Docker)

The `nginx/` directory contains a Docker Compose setup to proxy port 80/443 to the Next.js server.

1. Create your site config in `nginx/conf.d/jericho.conf` (see [`docs/guides/how-to-deploy.mdx`](./docs/guides/how-to-deploy.mdx) for an example)
2. Place SSL certs in `nginx/certs/` (`jericho.crt` and `jericho.key`)
3. Start the container:

```bash
cd nginx
docker compose up -d
```

Logs are written to `nginx/logs/`.

---

## Further Reading

- [Getting Started](./docs/getting-started.mdx) — full setup including first admin user
- [Deployment Guide](./docs/guides/how-to-deploy.mdx) — production checklist
- [Environment Variables](./docs/reference/environment-variables.mdx) — all config options
- [Architecture](./docs/architecture/project-structure.mdx) — codebase structure

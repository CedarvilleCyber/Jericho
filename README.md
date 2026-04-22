# Jericho

Jericho is a Cedarville University senior design project dedicated to creating cyber-physical training scenarios for high school and college students.

One of our primary goals is accessibility. We use [Ludus](https://ludus.cloud) (an open-source infrastructure-as-code tool) to build scenario networks. Ludus configuration files are in the `ludus-configs/` directory.

Full documentation is available at `/docs` on a running instance, or by reading the source in `website/docs/`.

---

## Prerequisites

- [Bun](https://bun.sh) (package manager / runtime)
- PostgreSQL 14+ database
- Proxmox VE instance (for VM management)
- Docker + Docker Compose (for the nginx reverse proxy)
- Optional: Microsoft Entra ID app registration (for OAuth sign-in)

---

## Development Setup

```bash
git clone <repo-url>
cd jericho/website
bun install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

At minimum you need:

```env
BETTER_AUTH_SECRET="<random-secret>"
BETTER_AUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/jericho"
```

Apply database migrations:

```bash
bunx prisma migrate deploy
```

Start the dev server:

```bash
bun run dev
```

The app is available at `http://localhost:3000`.

See [`website/docs/getting-started.mdx`](website/docs/getting-started.mdx) for full setup details including first admin user creation.

---

## Production Deployment

Build and start the production server (listens on port 3000):

```bash
bun run build
bun run start
```

Run migrations before starting:

```bash
bunx prisma migrate deploy
```

See [`website/docs/guides/how-to-deploy.mdx`](website/docs/guides/how-to-deploy.mdx) for environment variable requirements and a deployment checklist.

---

## Nginx Reverse Proxy (Docker)

The `website/nginx/` directory contains a Docker Compose setup to run nginx as a reverse proxy in front of the Next.js server.

Visit [`website/nginx/README.md`](website/nginx/README.md) for detailed instructions.

### Setup

**Start the container** from the `website/nginx/` directory:

```bash
cd website/nginx
docker compose up -d
```

Logs are written to `website/nginx/logs/`. The container restarts automatically unless stopped.

### Directory layout

```
website/nginx/
├── docker-compose.yaml   # nginx service definition
├── nginx.conf            # main nginx config (loaded by container)
├── conf.d/               # site configs (create this, add .conf files)
├── certs/                # SSL certificates (create this, add your certs)
└── logs/                 # access and error logs (created on first run)
```

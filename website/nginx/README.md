# Development Nginx Reverse Proxy

This nginx setup provides a development environment that mirrors the production configuration.

## Setup

### Configuration

- **jericho.local** → Next.js app (port 3000)
- **pve.jericho.local** → Proxmox VE at 192.168.2.218:8006

Cookies are automatically rewritten to the `.jericho.local` domain to enable SSO between the main site and Proxmox.

Ensure that the following lines are in your hosts file:

```
127.0.0.1 jericho.local
127.0.0.1 pve.jericho.local
```

__NOTE__: You will have to visit both the sites outside of an iframe to get rid of the self-signed cert message.

### Usage

1. Start your Next.js development server:
   ```bash
   bun dev
   ```

2. Start the nginx reverse proxy:
   ```bash
   cd nginx
   docker compose up -d
   ```

3. Access the sites:
   - Main website: http://localhost
   - Proxmox VE: http://pve.localhost

### Stopping

```bash
docker compose down
```

### Logs

View nginx logs:
```bash
docker compose logs -f
```

Logs are also available in the `./logs` directory.

### Notes

- The nginx container uses `host.docker.internal` to access your Next.js dev server on the host machine
- Proxmox SSL verification is disabled since it uses self-signed certificates
- Cookies set on `.localhost` will be shared between localhost and pve.localhost

# Jericho Traffic Management System

A CTF web challenge simulating the traffic control panel for the fictional City of Jericho Department of Transportation. Players interact with a PHP application containing several intentional vulnerabilities to find and exploit.

## Running Locally

The app runs inside the official `php:8.2-apache` Docker image. The entire `control-panels/` directory is mounted as the web root, so the traffic-light app is served under the `/traffic-light/` path.

```bash
docker run -d \
  --name traffic-ctf \
  -p 8080:80 \
  -v /path/to/control-panels/:/var/www/html \
  php:8.2-apache
```

Then open: http://localhost:8080/traffic-light/

### Uploads directory

The `uploads/` directory must be writable by the web server for file upload to work:

```bash
docker exec traffic-ctf chmod 777 /var/www/html/traffic-light/uploads
```

### Stopping / removing the container

```bash
docker stop traffic-ctf && docker rm traffic-ctf
```

## Pages

| Path | Auth Required | Description |
|------|--------------|-------------|
| `/traffic-light/advisories.php` | No | Public portal listing uploaded advisory documents |
| `/traffic-light/login.php` | No | Login form for authorized personnel |
| `/traffic-light/index.php` | Yes | Traffic light control panel |
| `/traffic-light/admin.php` | Yes | Upload and manage advisory documents |
| `/traffic-light/api.php` | Yes | JSON API for control panel actions |

## Credentials

```
Username: admin
Password: traffic1
```

## Intentional Vulnerabilities

This challenge contains several deliberate security flaws. A partial list (for challenge authors):

- **Weak credentials** — `admin:traffic1` appears in rockyou.txt
- **Unrestricted file upload** — `admin.php` only blocks `.php` extensions; `.phtml`, `.php5`, `.phar`, and other Apache-executable extensions are accepted
- **No CSRF protection** — all state-changing forms and API calls lack tokens
- **Session fixation** — session ID is not regenerated on login

## File Structure

```
traffic-light/
├── index.php          # Control panel (auth required)
├── admin.php          # File upload management (auth required)
├── advisories.php     # Public advisory listing (no auth)
├── login.php          # Login form
├── logout.php         # Session teardown
├── api.php            # JSON API endpoint (auth required)
├── include.php        # CDN links + theme init script
├── topnav.php         # Shared header/navbar
├── css/
│   ├── global.css     # Shared styles, dark mode overrides
│   └── control.css    # Control panel-specific styles
├── js/
│   └── control.js     # Control panel interactivity
├── public/
│   ├── sun.svg
│   └── moon.svg
└── uploads/           # Advisory document storage (web-accessible)
```

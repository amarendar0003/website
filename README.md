# CS-DPCRU Institutional Website

A responsive static website for the CNLU–GIGA Cyber Security and Data Protection Compliance Research Unit (CS-DPCRU), built with HTML, CSS and vanilla JavaScript.

## Pages

- `index.html` — homepage and concise focus-area previews
- `about.html` — the Unit's overview, vision, mission and objectives
- `cyber-security.html` — cybersecurity focus areas
- `data-protection.html` — data protection and privacy compliance
- `data-trust.html` — data trust and national security
- `collaborations.html` — collaboration areas and activities
- `research.html` — research themes and verified-publications library
- `contact.html` — existing institutional contact placeholders and enquiry form preview

Shared styling and behavior are in `styles.css` and `script.js`; local illustrations and images are in `assets/`.

## English and Hindi

Pages using the shared institutional header and `script.js` display a Google Translate
English/हिन्दी switch. The language choice is remembered across pages; new pages using
this shared shell are translated automatically. Translation is machine-generated and may
not be accurate for legal or technical content. When Hindi is selected, page text is
processed by Google Translate; do not treat translated text as an authoritative or
reviewed version.

Every new HTML page must include the `.gigw-lang` language-control container, load
`script.js`, and use the translation-enabled Content Security Policy below. Without the
Google Translate sources in the policy, the browser blocks translation on that page.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com; frame-src 'self' https://translate.google.com;" />
```

## Run locally

The enquiry form and website are served together by the Python backend. Install its requirements from the project folder:

```bash
python -m pip install -r backend/requirements.txt
```

The supplied Neon connection string is configured in the private, Git-ignored `backend/.env` file. Run from the project folder:

```bash
python -m backend.app
```

Open <http://localhost:3001> in a browser. The backend creates the `enquires` table if it does not already exist and accepts form submissions at `/api/enquiries`.

The form stores the submitted name, optional organisation, email, mobile number, nature of enquiry and message. Keep `backend/.env` private; it is excluded by `backend/.gitignore`. Official contact details remain marked “to be confirmed” until approved values are supplied.

## Research and publications

The Research page (`/research.html`) reads publication records from the PostgreSQL
database through `GET /api/publications`. Visitors can search and filter by category,
publication year, document type and author, sort results, and page through the results.
Selecting a record opens its reader at `/publications/<id>`, which displays the available
publication details and content and provides a PDF or document link when one is configured.

The `research_publications` table stores publication metadata and content, including
title, authors, category, document type, dates, abstract, keywords, publication status and
document URLs. On an empty table, the backend seeds sample records. Only published,
non-archived, public records appear in the visitor-facing API. The API also provides
`GET /api/publications/<id>` for an individual public record.

## Admin dashboard

The admin interface is served at `/admin/` (login), `/admin/dashboard.html` (overview),
and `/admin/publications.html` (publication management). Sign-in uses server-side Flask
sessions; the dashboard and publication-management APIs require an authenticated session.
Administrators can create, edit, publish, archive, and delete publication records. The
dashboard summarizes publication counts and recent activity.

Configure the initial administrator and session secret in the private `backend/.env` or
the deployment environment before starting the backend:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=use-a-strong-random-password
ADMIN_EMAIL=admin@example.com
SECRET_KEY=use-a-long-random-secret
```

Use unique, strong values in production and keep them out of Git. The backend creates or
updates the administrator account from `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
`ADMIN_EMAIL` during database initialization. Admin authentication endpoints are
`POST /api/admin/login`, `POST /api/admin/logout`, and `GET /api/admin/me`. Publication
management endpoints are under `/api/admin/publications`; the dashboard data is available
at `/api/admin/summary`.

## Deploy updates to the server

The public site is at <http://103.169.178.87/website/>. The server Git checkout is
`/home/git/cs-dpcru-source`; connect with `ssh git@103.169.178.87`.

### Before each deployment

1. Make and test the change locally.
2. Review `git status --short` and stage only the intended source files. Do not add
   `.env` files, credentials, or the unrelated nested `website/` directory.
3. Commit and push the change to `main`:

   ```bash
   git add <changed-files>
   git diff --cached --check
   git commit -m "Describe the change"
   git push origin main
   ```

Deploy only the part you changed, using the appropriate procedure below.

### Static website (HTML, CSS, JavaScript, and assets)

SSH to the server and run the installed static deployment script:

```bash
ssh git@103.169.178.87
sudo /home/git/deploy-website.sh
```

The script fast-forwards the server checkout from `origin/main`, publishes static files
to `/var/www/website`, and checks the homepage and contact page. It keeps a timestamped
backup and restores the previous site if those checks fail. Verify the public pages after
deployment:

```bash
curl -I http://103.169.178.87/website/
curl -I http://103.169.178.87/website/contact.html
```

This script publishes static files only. It does not deploy backend code, edit Nginx, or
restart Trakagile. Direct edits to `/var/www/website` are not in Git and may be replaced
by the next deployment.

### Enquiry backend (Python/API)

Port `3000` belongs to another application. The website API listens privately on
`127.0.0.1:3001`; Nginx forwards only `/api/` requests to it. Do not change the existing
port `3000`, catch-all route, `/sam`, `/website/`, or Trakagile routes.

For each backend code or dependency update, after pushing the change, SSH to the server
and update the checkout and virtual environment:

```bash
ssh git@103.169.178.87
cd /home/git/cs-dpcru-source
git pull --ff-only origin main
sudo runuser -u git -- /home/git/cs-dpcru-source/backend/.venv/bin/python -m pip install -r /home/git/cs-dpcru-source/backend/requirements.txt
sudo systemctl restart cnlu-giga-website-backend.service
```

Check the service and both local and public health endpoints:

```bash
sudo systemctl status cnlu-giga-website-backend.service --no-pager
curl --fail http://127.0.0.1:3001/api/health
curl --fail http://103.169.178.87/api/health
```

The expected health response is `{"status":"ok"}`. If the restart or health check fails,
inspect the service log:

```bash
sudo journalctl -u cnlu-giga-website-backend.service --no-pager -n 80
```

`backend/deploy-server.sh` is the one-time server setup script. It installs the service
and adds the Nginx `/api/` route; it intentionally refuses to overwrite an existing
service or duplicate that route. Do not run it for routine code deployments.

### Secrets, database, and rollback

`backend/.env` is server-only configuration and must remain Git-ignored with permissions
`600`. Never commit it, copy it into `/var/www/website`, or paste its database URL into
chat. A secret change must be applied securely to the server's
`/home/git/cs-dpcru-source/backend/.env`, then restart the backend service and verify its
health. Do not overwrite an existing server `.env` with a deployment archive.

The backend initializes the enquiry, admin, publication, and activity-log tables when its
service starts and seeds sample publications only when the publication table is empty;
this is not a general database migration system. Review and back up the database before
deploying schema changes that need migrations.

For a code rollback, revert the bad commit in Git, push the revert to `main`, then follow
the matching static or backend deployment procedure above. Do not use `git reset` on the
shared server checkout. Static deployment also restores its previous file backup
automatically when its built-in checks fail.

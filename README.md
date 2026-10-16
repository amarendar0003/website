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

## Deploy updates to the server

The public static site is served at <http://103.169.178.87/website/> from `/var/www/website`.
To publish changes to that site:

1. Commit your changes locally and push them to the repository's `main` branch.
2. Connect to the server over SSH as the authorized `git` account.
3. Run the deployment script:

   ```bash
   sudo /home/git/deploy-website.sh
   ```

The script fast-forwards its Git checkout from `origin/main`, stages the site, and checks
the homepage and contact page before completing. It keeps the previous site in a
timestamped backup and restores it if those checks fail. It does not change Nginx
configuration or restart the Trakagile application. The nested `website/` folder is
excluded from this deployment.

Use Git as the source of truth: direct edits to `/var/www/website` are not committed and
may be replaced by the next deployment. This script publishes static files only; changes
to the Python backend or its environment/database configuration require a separate
backend deployment process.

### Deploy the enquiry backend

The server's port `3000` is already used by another application. The CS-DPCRU API runs
on `127.0.0.1:3001` instead; it is not exposed directly to the internet. Nginx forwards
only `/api/` requests on the IP virtual host to this backend, leaving the existing
homepage, `/sam`, `/website/`, and other application routes unchanged.

After committing and pushing backend changes, connect over SSH as `git` and update the
checkout:

```bash
cd /home/git/cs-dpcru-source
git pull --ff-only origin main
sudo /home/git/cs-dpcru-source/backend/deploy-server.sh
```

The script installs backend requirements in an isolated virtual environment, creates and
starts a dedicated systemd service, initializes the database table, and adds the
website-only `/api/` Nginx route. It checks the API health endpoint and Nginx
configuration, retries the proxied health check while Nginx reloads, and rolls back the
service and route if validation fails. It keeps a timestamped Nginx backup. Keep
`backend/.env` private with permissions `600`; do not commit it or paste its database URL
into chat.

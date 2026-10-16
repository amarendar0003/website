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

## Run locally

From the project folder, start the Python static server:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000> in a browser. All pages and assets are served from the same project root, so the same relative paths work on every page.

The enquiry form is a preview only: it copies entered details when clipboard access is available and does not send or store them. Official contact details remain marked “to be confirmed” until approved values are supplied.

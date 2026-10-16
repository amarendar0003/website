#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR=/home/git/cs-dpcru-source
readonly BACKEND_DIR="$APP_DIR/backend"
readonly VENV_DIR="$BACKEND_DIR/.venv"
readonly ENV_FILE="$BACKEND_DIR/.env"
readonly SERVICE_NAME=cnlu-giga-website-backend
readonly SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
readonly NGINX_FILE=/etc/nginx/sites-available/employee-management
readonly NGINX_MARKER="# BEGIN CNLU-GIGA WEBSITE API"

if [[ $EUID -ne 0 ]]; then
  echo "Run this script with sudo: sudo /home/git/cs-dpcru-source/backend/deploy-server.sh" >&2
  exit 1
fi

if [[ ! -d "$BACKEND_DIR" || ! -f "$ENV_FILE" || ! -f "$NGINX_FILE" ]]; then
  echo "Required backend, private environment file, or Nginx site config is missing." >&2
  exit 1
fi

if [[ "$(stat -c '%a' "$ENV_FILE")" != 600 ]]; then
  echo "Expected backend/.env permissions to be 600; refusing to start." >&2
  exit 1
fi

if ! grep -q '^DATABASE_URL=.' "$ENV_FILE" || ! grep -qx 'PORT=3001' "$ENV_FILE"; then
  echo "backend/.env must contain DATABASE_URL and PORT=3001." >&2
  exit 1
fi

if [[ ! -x "$(command -v python3 || true)" || ! -x "$(command -v runuser || true)" ]]; then
  echo "python3 and runuser are required." >&2
  exit 1
fi

if [[ -e "$SERVICE_FILE" ]]; then
  echo "Service file already exists; refusing to replace it: $SERVICE_FILE" >&2
  exit 1
fi

if [[ ! -f "$NGINX_FILE" ]] || ! grep -q 'server_name 103\.169\.178\.87;' "$NGINX_FILE"; then
  echo "Expected IP website virtual host was not found; refusing to edit Nginx." >&2
  exit 1
fi

if ! grep -q 'location / {' "$NGINX_FILE" || ! grep -q 'proxy_pass http://192\.168\.122\.236:3000;' "$NGINX_FILE"; then
  echo "Expected existing catch-all route was not found; refusing to edit Nginx." >&2
  exit 1
fi

if grep -Eq 'location ([^ ]+ )?/api/|location = /api' "$NGINX_FILE"; then
  echo "An API Nginx route already exists; refusing to add a duplicate." >&2
  exit 1
fi

if [[ ! -d "$VENV_DIR" ]]; then
  runuser -u git -- python3 -m venv "$VENV_DIR"
fi
runuser -u git -- "$VENV_DIR/bin/python" -m pip install --disable-pip-version-check -r "$BACKEND_DIR/requirements.txt"

nginx_backup="${NGINX_FILE}.before-cs-dpcru-api.$(date +%Y%m%d%H%M%S)"
cp -a "$NGINX_FILE" "$nginx_backup"
service_created=0
nginx_changed=0
deployment_complete=0

rollback() {
  result=$?
  if [[ $result -ne 0 && $deployment_complete -ne 1 ]]; then
    echo "Deployment failed; rolling back website backend service and API route." >&2
    if [[ $service_created -eq 1 ]]; then
      systemctl disable --now "$SERVICE_NAME.service" >/dev/null 2>&1 || true
      rm -f "$SERVICE_FILE"
      systemctl daemon-reload || true
    fi
    if [[ $nginx_changed -eq 1 ]]; then
      cp -a "$nginx_backup" "$NGINX_FILE"
      if nginx -t; then
        systemctl reload nginx || true
      fi
    fi
  fi
  exit "$result"
}
trap rollback EXIT

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=CNLU-GIGA website enquiry API
After=network-online.target
Wants=network-online.target

[Service]
Type=exec
User=git
Group=git
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
Environment=PYTHONUNBUFFERED=1
Environment=PYTHONDONTWRITEBYTECODE=1
ExecStartPre=$VENV_DIR/bin/python -c "from backend.database import initialize_database; initialize_database()"
ExecStart=$VENV_DIR/bin/gunicorn --workers 2 --bind 127.0.0.1:3001 --access-logfile - --error-logfile - backend.app:app
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
UMask=0077

[Install]
WantedBy=multi-user.target
EOF
chmod 644 "$SERVICE_FILE"
service_created=1
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME.service"

healthy=0
for _ in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 3 http://127.0.0.1:3001/api/health >/dev/null; then
    healthy=1
    break
  fi
  sleep 1
done
if [[ $healthy -ne 1 ]]; then
  echo "Backend did not become healthy on 127.0.0.1:3001." >&2
  systemctl status "$SERVICE_NAME.service" --no-pager || true
  exit 1
fi

python3 - "$NGINX_FILE" "$NGINX_MARKER" <<'PY'
from pathlib import Path
import sys

config_path = Path(sys.argv[1])
marker = sys.argv[2]
config = config_path.read_text()
if marker in config:
    raise SystemExit("Website API route marker already exists; refusing to duplicate it.")

anchor = "    location / {\n        proxy_pass http://192.168.122.236:3000;"
if config.count(anchor) != 1:
    raise SystemExit("Expected exactly one existing catch-all proxy location; Nginx was not modified.")

route = """    # BEGIN CNLU-GIGA WEBSITE API
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # END CNLU-GIGA WEBSITE API

"""
mode = config_path.stat().st_mode
config_path.write_text(config.replace(anchor, route + anchor))
config_path.chmod(mode & 0o777)
PY
nginx_changed=1

nginx -t
systemctl reload nginx
curl --fail --silent --show-error --max-time 5 \
  -H 'Host: 103.169.178.87' http://127.0.0.1/api/health >/dev/null

deployment_complete=1
trap - EXIT
echo "Website enquiry API is healthy on localhost:3001 and routed through /api/."
echo "Nginx backup: $nginx_backup"

#!/usr/bin/env bash
# DigitalOcean deployment script — Sianlk
# Prerequisites: doctl installed and authenticated
# Install: https://docs.digitalocean.com/reference/doctl/how-to/install/

set -euo pipefail

APP_NAME="sianlk-production"
REGION="nyc"
SPEC_FILE=".do/app.yaml"

echo "=== Sianlk — DigitalOcean Deployment ==="
echo "Region: $REGION"

# Check doctl
if ! command -v doctl &>/dev/null; then
  echo "ERROR: doctl not found. Install from https://docs.digitalocean.com/reference/doctl/"
  exit 1
fi

# Validate auth
doctl auth list || { echo "ERROR: Run 'doctl auth init' first"; exit 1; }

# Check if app already exists
EXISTING=$(doctl apps list --no-header --format Name 2>/dev/null | grep "^$APP_NAME$" || true)

if [ -z "$EXISTING" ]; then
  echo "Creating new DigitalOcean App..."
  doctl apps create --spec "$SPEC_FILE" --wait
  echo "App created successfully!"
else
  # Get app ID
  APP_ID=$(doctl apps list --no-header --format ID,Name | grep "$APP_NAME" | awk '{print $1}')
  echo "Updating existing app (ID: $APP_ID)..."
  doctl apps update "$APP_ID" --spec "$SPEC_FILE" --wait
  echo "App updated successfully!"
fi

# Force deploy latest
APP_ID=$(doctl apps list --no-header --format ID,Name | grep "$APP_NAME" | awk '{print $1}')
echo "Triggering deployment..."
doctl apps create-deployment "$APP_ID" --wait --no-reuselatestdeployment

echo ""
echo "=== Deployment Complete ==="
echo "URL: https://sianlk.sianlk.com"
echo "Dashboard: https://cloud.digitalocean.com/apps/$APP_ID"
echo ""

# Show active deployment
doctl apps get-deployment "$APP_ID" $(doctl apps list-deployments "$APP_ID" --no-header --format ID | head -1) --format Phase,Progress,CreatedAt

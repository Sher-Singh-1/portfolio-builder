#!/usr/bin/env bash

set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is required but not available."
  exit 1
fi

echo "Setup complete."
echo "No /etc/hosts change is required because *.localhost resolves locally in modern browsers."
echo "You can now run ./scripts/start-portfolio-local.sh"

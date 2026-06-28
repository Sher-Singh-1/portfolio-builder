#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

docker compose up --build -d
docker compose ps
echo "Opening live logs. Press Ctrl+C to stop watching logs."
docker compose logs -f

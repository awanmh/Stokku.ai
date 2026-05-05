#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please review and update .env before going to production!"
  echo ""
fi

echo "🚀 Starting stokku.ai services..."
docker-compose up -d

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     stokku.ai is starting up...          ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Web Dashboard:  http://localhost:3000   ║"
echo "║  API Server:     http://localhost:8080   ║"
echo "║  Health Check:   http://localhost:8080/health ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Use 'docker-compose logs -f' to view logs."
echo "Use 'docker-compose down' to stop all services."

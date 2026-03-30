# Stokku.ai — Setup Guide

This guide will help you get the Stokku.ai inventory management system up and running on your local machine.

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire stack (PostgreSQL, Redis, Backend, and Frontend) is using Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Steps
1. Navigate to the `docker` directory:
   ```bash
   cd docker
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Start all services:
   ```bash
   docker-compose up -d
   ```
4. Access the applications:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
   - **API Health Check**: [http://localhost:8080/health](http://localhost:8080/health)

---

## 🛠️ Local Development Setup (Manual)

If you prefer to run the components manually for development, follow these steps.

### Prerequisites
- [Go](https://go.dev/dl/) (v1.21+)
- [Node.js](https://nodejs.org/) (v18+) & `npm`
- Running instances of **PostgreSQL** and **Redis**

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   go mod download
   ```
4. Run the API:
   ```bash
   go run cmd/api/main.go
   ```

### 2. Frontend Setup
1. Navigate to the `web` directory:
   ```bash
   cd web
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `APP_ENV` | Application environment | `development` |
| `SERVER_PORT` | Port for the API server | `8080` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | PostgreSQL database name | `stokku` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT signing | `change-me` |

---

## 📖 Useful Commands

| Command | Directory | Description |
|---|---|---|
| `docker-compose logs -f` | `/docker` | View live logs from all containers |
| `docker-compose down` | `/docker` | Stop and remove all containers |
| `go test ./...` | `/backend` | Run backend unit tests |
| `npm run build` | `/web` | Build the frontend for production |

---

## 📂 Documentation Reference
- **API Full Docs**: [Detailed Endpoints](file:///backend/API_DOCS.md)
- **Database Schema**: Check the SQL files in [migrations](file:///backend/migrations)

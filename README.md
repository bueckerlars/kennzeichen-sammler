# Kennzeichen Sammler

Eine Full-Stack React/Node.js Anwendung zum Sammeln deutscher Kfz-Kennzeichen.

## Features

- 🔐 Benutzerauthentifizierung mit JWT
- 🔍 Suche nach deutschen Kennzeichen
- 📊 Statistiken und Fortschrittsanzeige
- 🏆 Bestenliste aller Nutzer
- 📱 Responsive Design mit Shadcn UI
- 🐳 Docker Support für einfaches Deployment
- 💾 Unterstützung für SQLite und PostgreSQL

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Shadcn UI
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express
- TypeScript
- TypeORM
- JWT Authentication
- bcrypt

### Database
- PostgreSQL (Production)
- SQLite (Development)

## Installation

### Voraussetzungen
- Node.js 20+
- npm oder yarn
- Docker & Docker Compose (optional)

### Lokale Entwicklung

1. **Repository klonen**
```bash
git clone <repository-url>
cd kennzeichen-sammler
```

2. **Backend Setup**
```bash
cd backend
npm install
cp ../.env.example .env
# Bearbeite .env nach Bedarf
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Datenbank seeden** (in einem neuen Terminal)
```bash
cd backend
npm run seed
```

### Docker Deployment

1. **Umgebungsvariablen konfigurieren**
```bash
cp .env.example .env
# Bearbeite .env nach Bedarf
```

2. **Container starten**
```bash
docker-compose up -d
```

3. **Datenbank seeden**
```bash
docker-compose exec backend npm run seed
```

Die Anwendung ist dann verfügbar unter:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Makefile Workflows

Für wiederkehrende Aufgaben kannst du das `Makefile` im Projektroot verwenden:

- **Dependencies installieren**
  ```bash
  make install
  ```

- **(Platzhalter-)Tests ausführen**
  ```bash
  make test
  ```

- **Build der Docker-Services und des Fullstack-Images**
  ```bash
  # baut docker-compose Services (postgres, backend, frontend)
  # und das Fullstack-Image (Backend + Frontend in einem Container)
  make build
  ```

- **Lokal deployen (via docker compose)**
  ```bash
  make deploy
  # Alias:
  make up
  ```

- **Fullstack-Image bauen und zu Docker Hub pushen**
  ```bash
  # vorab bei Docker Hub einloggen:
  # docker login

  # FULLSTACK_IMAGE und TAG kannst du bei Bedarf anpassen
  FULLSTACK_IMAGE=myuser/kennzeichen-sammler TAG=latest make build_and_push
  ```

Weitere Hilfstargets:

- `make down` – Stoppt und entfernt die docker-compose Services.
- `make logs` – Zeigt die Logs des docker-compose Stacks an (`-f` für Follow).

## Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Konfigurationsoptionen.

### Wichtige Variablen:
- `DB_TYPE`: `postgres` für PostgreSQL oder leer für SQLite
- `JWT_SECRET`: Geheimer Schlüssel für JWT (in Production ändern!)
- `DB_*`: Datenbank-Konfiguration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrierung
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Aktueller Benutzer

### License Plates
- `GET /api/license-plates` - Alle Kennzeichen
- `GET /api/license-plates/search?q=...` - Suche

### Collection
- `GET /api/collection` - Eigene Sammlung
- `POST /api/collection` - Kennzeichen hinzufügen
- `DELETE /api/collection/:id` - Aus Sammlung entfernen

### Statistics
- `GET /api/statistics` - Benutzer-Statistiken
- `GET /api/statistics/leaderboard` - Bestenliste

## Projektstruktur

```
kennzeichen-sammler/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API Controller
│   │   ├── services/       # Business Logic
│   │   ├── models/         # TypeORM Entities
│   │   ├── routes/         # Express Routes
│   │   ├── middleware/     # Auth Middleware
│   │   ├── config/         # Database Config
│   │   └── data/           # Seed Daten
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Komponenten
│   │   ├── pages/          # Seiten
│   │   ├── context/        # React Context
│   │   ├── services/       # API Services
│   │   └── types/          # TypeScript Types
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Entwicklung

### Backend Scripts
- `npm run dev` - Entwicklungsserver
- `npm run build` - Production Build
- `npm run start` - Production Server
- `npm run seed` - Datenbank seeden

### Frontend Scripts
- `npm run dev` - Entwicklungsserver
- `npm run build` - Production Build
- `npm run preview` - Production Preview

## Lizenz

MIT


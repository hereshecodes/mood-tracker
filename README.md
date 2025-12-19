# Mood Tracker

A full-stack mood tracking application with Docker containerization.

## Tech Stack

- **Frontend**: React, Recharts
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## Features

- Log daily moods with emoji selection
- Track energy levels (1-5)
- Add optional notes to entries
- View mood history
- Visualize mood distribution with charts
- Persistent data storage

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Run the Application

```bash
# Clone the repository
git clone https://github.com/hereshecodes/mood-tracker.git
cd mood-tracker

# Start all services
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Stop the Application

```bash
docker-compose down

# To also remove the database volume:
docker-compose down -v
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/moods` | Get all mood entries |
| GET | `/api/moods/stats` | Get mood statistics |
| POST | `/api/moods` | Create a mood entry |
| DELETE | `/api/moods/:id` | Delete a mood entry |

## Project Structure

```
mood-tracker/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── index.js
│       └── index.css
└── backend/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── index.js
```

## License

MIT

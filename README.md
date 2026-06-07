# Video Ratings

A web application for cataloging, rating, and searching privately owned video media. It combines a tag-based scoring system with performer ratings, allowing you to manage your collection using evaluation axes tailored to your preferences.

[日本語版はこちら (Japanese version)](README.ja.md)

## Features

- **Work Management** — Manual registration, CSV import, editing, and deletion. Supports multiple SMB URL file paths.
- **Performer Management** — Manage performers (names, furigana) and link them to works (with lead performer flag).
- **Tag Rating** — Scoring via tag categories and tags. Total evaluation is calculated by summing work scores and lead performer scores.
- **Custom Fields** — Assign user-defined fields (text, number, date, checkbox) to works and performers.
- **View Customization** — Select and reorder display columns in work/performer lists. Custom fields and tag categories can also be displayed as columns.
- **Search & Filter** — Filter by work title, performer name, furigana, tags, studio, series, and custom fields.
- **External Integration** — Quick links to Google Search for performer names and work titles.
- **Data Management** — Full database backup and restore via JSON export/import.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |

---

## User Guide

### Basic Usage

#### Registering a Work

1. Navigate to the **Works** list from the sidebar.
2. Click the **New** button.
3. Enter the Title (required), Studio, Series, Performers, and File Paths, then save.

#### Customizing Display Columns

1. Click the **Column Settings** icon at the top right of a list page (Works or Performers).
2. Check the columns you want to display. Custom fields and tag categories are also selectable.
3. Settings are saved in your browser.

#### Batch Import via CSV

Upload a CSV file from the **Import** page in the sidebar with the following columns (`performer_furiganas` and `directory_path` are optional):

```
title,performer_names,performer_furiganas,directory_path
Work A,John Doe,john doe,smb://nas/share/a
Work B,John Doe Jane Smith,john doe jane smith,
```

- `performer_names` / `performer_furiganas` should be space-separated for multiple values.
- You can preview and validate the data before importing.

#### Scoring with Tags

1. Create tag categories in the **Tags** page (set target to Work or Performer, and toggle multiple selection).
2. Add tags within categories (assign integer scores; tags without scores act as labels).
3. Select tags on the Work or Performer detail page.

**Score Calculation:**

```
Total Work Score = Σ(Work Tag Scores) + Sum of Lead Performer Scores
```

Tags without a score (null) are treated as 0. Performer tag scores are only reflected in works where they are marked as the lead.

#### Backup and Restore

1. In the "Data Management" section of the **Settings** page, click **Export** to save a JSON file.
2. To restore, click **Import** in the same section and select the JSON file.
3. **Warning:** Importing will completely overwrite (delete) all current data in the database.

---

## Developer Guide

### Prerequisites

- Docker & Docker Compose
- (Local dev only) Python 3.12+, Node.js 20+

### Setup

```bash
git clone <repository-url>
cd video-ratings
docker compose up -d
```

Access URLs after startup:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 |

### Directory Structure

```
video-ratings/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routers/         # API routers (works, performers, tags, ...)
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic (scoring, etc.)
│   └── alembic/             # DB migrations
├── frontend/
│   └── src/
│       ├── pages/           # Page components
│       ├── components/ui/   # shadcn/ui components
│       ├── api/             # API client
│       └── types/           # TypeScript definitions
└── docker-compose.yml
```

### Environment Variables

Create `backend/.env` based on `backend/.env.example` (not required when using Docker Compose):

```
DATABASE_URL=postgresql://video_ratings:video_ratings@localhost:5432/video_ratings
```

### Migrations

```bash
# Run inside container
docker compose exec backend alembic upgrade head

# Create a new migration
docker compose exec backend alembic revision --autogenerate -m "description"
```

### Local Development (without Docker)

**Backend:**

```bash
cd backend
pip install -e .
DATABASE_URL=postgresql://... uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

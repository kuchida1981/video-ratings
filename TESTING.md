# Testing & Linting

## Backend

```bash
# lint
docker compose exec backend ruff check app/
docker compose exec backend ruff format --check app/

# unit tests with coverage
docker compose exec backend pytest -m unit --cov=app
```

## Frontend

```bash
# lint
docker compose exec frontend npm run lint

# tests with coverage
docker compose exec frontend npm run test:coverage
```

## pre-commit hooks

Install `pre-commit` (Python package) once on your local machine:

```bash
pip install pre-commit
pre-commit install
```

After installation, ruff lint/format, eslint, tsc, and pytest unit tests run automatically on each `git commit`.

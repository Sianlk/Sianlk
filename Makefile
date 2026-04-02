# Development convenience commands
.PHONY: dev test lint security load-test deploy-local clean

dev:
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

test:
pytest tests/ -v --cov=api --cov-report=term-missing -x

test-fast:
pytest tests/ -x -q

lint:
ruff check api/ tests/
bandit -r api/ -ll

security:
bandit -r api/ -ll
safety check -r requirements.txt
ruff check api/

load-test:
k6 run tests/load_test.js --vus 10 --duration 30s

migrate:
alembic upgrade head

migrate-create:
alembic revision --autogenerate -m "$(MSG)"

deploy-local:
docker compose up --build -d

deploy-local-logs:
docker compose logs -f

clean:
docker compose down -v
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
find . -name "*.pyc" -delete

format:
ruff format api/ tests/

check-all: lint security test
@echo "All checks passed!"

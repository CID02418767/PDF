# PDF Editor

A small FastAPI website for working with PDF files. Version 1 supports:

- Merging \(N\) PDF files into one PDF.
- Splitting pages \(a\) through \(b\) from one PDF into \(k\) balanced PDF parts inside a ZIP archive.

## Tech Stack

- Python 3.11+
- FastAPI
- pypdf
- Jinja2 templates
- Pytest

## Local Setup

Install Python 3.11 or newer, then run:

```powershell
cd D:\Vibecoding\pdf
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

Do not open `app/templates/index.html` directly with `file://`. This app needs the FastAPI server because `/merge` and `/split` are backend endpoints.

## Tests

```powershell
pytest
```

The test suite checks that two PDFs merge into the expected total page count, that one PDF splits the selected page range into the requested number of parts, and that invalid uploads or split options are rejected.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Web interface |
| `GET` | `/healthz` | Health check for deployment platforms |
| `POST` | `/merge` | Upload multiple PDFs with the field name `files`; returns `merged.pdf` |
| `POST` | `/split` | Upload one PDF with `file`, `start_page`, `end_page`, and `parts`; returns `split-pages.zip` |

## Deploy to Render

Create a new Render Web Service from the public GitHub repository.

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

The included `render.yaml` can also be used as a blueprint.

## Deploy to Railway

Create a new Railway project from the public GitHub repository.

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## GitHub Upload

After installing Git for Windows:

```powershell
cd D:\Vibecoding\pdf
git init
git add .
git commit -m "Create FastAPI PDF editor"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pdf.git
git push -u origin main
```

Create a public GitHub repository named `pdf` before running the remote and push commands.

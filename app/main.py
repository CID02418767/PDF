from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.pdf_service import PdfProcessingError, merge_pdf_files, split_pdf_by_range, zip_files


BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="PDF Editor",
    description="Merge multiple PDFs and split one PDF range into multiple PDF parts.",
    version="1.0.0",
)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/merge")
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least two PDF files.")

    workspace = Path(tempfile.mkdtemp(prefix="pdf-editor-merge-"))
    background_tasks.add_task(shutil.rmtree, workspace, ignore_errors=True)

    try:
        input_paths = [await _save_pdf_upload(file, workspace) for file in files]
        output_path = workspace / "merged.pdf"
        merge_pdf_files(input_paths, output_path)
    except PdfProcessingError as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise HTTPException(status_code=500, detail="Unable to merge the uploaded PDFs.") from exc

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="merged.pdf",
        background=background_tasks,
    )


@app.post("/split")
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int | None = Form(None),
    parts: int = Form(1),
):
    workspace = Path(tempfile.mkdtemp(prefix="pdf-editor-split-"))
    background_tasks.add_task(shutil.rmtree, workspace, ignore_errors=True)

    try:
        input_path = await _save_pdf_upload(file, workspace)
        pages_dir = workspace / "pages"
        pages_dir.mkdir()
        page_paths = split_pdf_by_range(input_path, pages_dir, start_page, end_page, parts)
        output_path = workspace / "split-pages.zip"
        zip_files(page_paths, output_path)
    except PdfProcessingError as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise HTTPException(status_code=500, detail="Unable to split the uploaded PDF.") from exc

    return FileResponse(
        output_path,
        media_type="application/zip",
        filename="split-pages.zip",
        background=background_tasks,
    )


async def _save_pdf_upload(file: UploadFile, workspace: Path) -> Path:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise PdfProcessingError("Only files ending in .pdf are accepted.")

    content = await file.read()
    if not content:
        raise PdfProcessingError("Uploaded PDF files cannot be empty.")

    if not content.startswith(b"%PDF"):
        raise PdfProcessingError("The uploaded file does not look like a valid PDF.")

    destination = workspace / f"{uuid4().hex}.pdf"
    destination.write_bytes(content)
    return destination

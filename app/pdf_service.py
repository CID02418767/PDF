from __future__ import annotations

from pathlib import Path
from typing import NamedTuple
from zipfile import ZIP_DEFLATED, ZipFile

from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError


class PdfProcessingError(ValueError):
    """Raised when an uploaded PDF cannot be processed safely."""


class PageRange(NamedTuple):
    start: int
    end: int


def merge_pdf_files(input_paths: list[Path], output_path: Path) -> int:
    if len(input_paths) < 2:
        raise PdfProcessingError("At least two PDF files are required for merging.")

    writer = PdfWriter()
    total_pages = 0

    for input_path in input_paths:
        reader = _open_reader(input_path)
        for page in reader.pages:
            writer.add_page(page)
            total_pages += 1

    if total_pages == 0:
        raise PdfProcessingError("The uploaded PDFs do not contain any pages.")

    with output_path.open("wb") as output_file:
        writer.write(output_file)

    return total_pages


def split_pdf_by_page(input_path: Path, output_dir: Path) -> list[Path]:
    reader = _open_reader(input_path)
    page_paths: list[Path] = []
    page_count = len(reader.pages)

    if page_count == 0:
        raise PdfProcessingError("The uploaded PDF does not contain any pages.")

    width = max(3, len(str(page_count)))
    for index, page in enumerate(reader.pages, start=1):
        writer = PdfWriter()
        writer.add_page(page)

        page_path = output_dir / f"page_{index:0{width}d}.pdf"
        with page_path.open("wb") as output_file:
            writer.write(output_file)
        page_paths.append(page_path)

    return page_paths


def split_pdf_by_range(input_path: Path, output_dir: Path, start_page: int, end_page: int | None, parts: int) -> list[Path]:
    reader = _open_reader(input_path)
    page_count = len(reader.pages)

    if page_count == 0:
        raise PdfProcessingError("The uploaded PDF does not contain any pages.")

    final_page = page_count if end_page is None else end_page
    _validate_split_request(start_page, final_page, parts, page_count)

    if parts == 1:
        chunks = [list(range(start_page, final_page + 1))]
    elif parts == 2:
        selected_pages = set(range(start_page, final_page + 1))
        remaining_pages = [page for page in range(1, page_count + 1) if page not in selected_pages]
        if not remaining_pages:
            raise PdfProcessingError("There are no remaining pages to create the second part.")
        chunks = [list(range(start_page, final_page + 1)), remaining_pages]
    else:
        raise PdfProcessingError("For 3 or more parts, provide one page range for each part.")

    return _write_page_chunks(reader, chunks, output_dir)


def split_pdf_by_ranges(input_path: Path, output_dir: Path, ranges: list[PageRange]) -> list[Path]:
    reader = _open_reader(input_path)
    page_count = len(reader.pages)

    if page_count == 0:
        raise PdfProcessingError("The uploaded PDF does not contain any pages.")

    if not ranges:
        raise PdfProcessingError("At least one page range is required.")

    chunks: list[list[int]] = []
    for page_range in ranges:
        _validate_page_range(page_range.start, page_range.end, page_count)
        chunks.append(list(range(page_range.start, page_range.end + 1)))

    return _write_page_chunks(reader, chunks, output_dir)


def _write_page_chunks(reader: PdfReader, chunks: list[list[int]], output_dir: Path) -> list[Path]:
    output_paths: list[Path] = []
    page_count = len(reader.pages)
    width = max(3, len(str(page_count)))

    for index, chunk in enumerate(chunks, start=1):
        writer = PdfWriter()
        for page_number in chunk:
            writer.add_page(reader.pages[page_number - 1])

        first_page = chunk[0]
        last_page = chunk[-1]
        output_path = output_dir / (
            f"part_{index:03d}_pages_{first_page:0{width}d}-{last_page:0{width}d}.pdf"
        )
        with output_path.open("wb") as output_file:
            writer.write(output_file)
        output_paths.append(output_path)

    return output_paths


def zip_files(input_paths: list[Path], output_path: Path) -> Path:
    if not input_paths:
        raise PdfProcessingError("No files were produced to zip.")

    with ZipFile(output_path, "w", compression=ZIP_DEFLATED) as archive:
        for input_path in input_paths:
            archive.write(input_path, arcname=input_path.name)

    return output_path


def _open_reader(input_path: Path) -> PdfReader:
    try:
        reader = PdfReader(str(input_path))
    except (PdfReadError, OSError) as exc:
        raise PdfProcessingError(f"{input_path.name} is not a readable PDF.") from exc

    if reader.is_encrypted:
        raise PdfProcessingError(f"{input_path.name} is encrypted and cannot be processed.")

    return reader


def _validate_split_request(start_page: int, end_page: int, parts: int, page_count: int) -> None:
    _validate_page_range(start_page, end_page, page_count)

    if parts < 1:
        raise PdfProcessingError("Number of parts must be 1 or greater.")


def _validate_page_range(start_page: int, end_page: int, page_count: int) -> None:
    if start_page < 1:
        raise PdfProcessingError("Start page must be 1 or greater.")

    if end_page < start_page:
        raise PdfProcessingError("End page must be greater than or equal to start page.")

    if end_page > page_count:
        raise PdfProcessingError(f"End page cannot be greater than the PDF page count ({page_count}).")

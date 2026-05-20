from pathlib import Path
from zipfile import ZipFile

from pypdf import PdfReader, PdfWriter
import pytest

from app.pdf_service import (
    PageRange,
    PdfProcessingError,
    merge_pdf_files,
    split_pdf_by_page,
    split_pdf_by_range,
    split_pdf_by_ranges,
    zip_files,
)


def write_pdf(path: Path, page_count: int) -> Path:
    writer = PdfWriter()

    for _ in range(page_count):
        writer.add_blank_page(width=72, height=72)

    with path.open("wb") as output_file:
        writer.write(output_file)

    return path


def test_merge_pdf_files_writes_all_pages(tmp_path):
    first = write_pdf(tmp_path / "first.pdf", 1)
    second = write_pdf(tmp_path / "second.pdf", 2)
    output = tmp_path / "merged.pdf"

    page_count = merge_pdf_files([first, second], output)

    assert page_count == 3
    assert len(PdfReader(str(output)).pages) == 3


def test_split_pdf_by_page_writes_numbered_outputs(tmp_path):
    source = write_pdf(tmp_path / "source.pdf", 2)
    output_dir = tmp_path / "pages"
    output_dir.mkdir()

    pages = split_pdf_by_page(source, output_dir)

    assert [page.name for page in pages] == ["page_001.pdf", "page_002.pdf"]
    assert all(len(PdfReader(str(page)).pages) == 1 for page in pages)


def test_split_pdf_by_range_writes_selected_range_and_remaining_pages(tmp_path):
    source = write_pdf(tmp_path / "source.pdf", 5)
    output_dir = tmp_path / "parts"
    output_dir.mkdir()

    parts = split_pdf_by_range(source, output_dir, start_page=2, end_page=3, parts=2)

    assert [part.name for part in parts] == ["part_001_pages_002-003.pdf", "part_002_pages_001-005.pdf"]
    assert [len(PdfReader(str(part)).pages) for part in parts] == [2, 3]


def test_split_pdf_by_ranges_writes_each_explicit_part(tmp_path):
    source = write_pdf(tmp_path / "source.pdf", 5)
    output_dir = tmp_path / "parts"
    output_dir.mkdir()

    parts = split_pdf_by_ranges(
        source,
        output_dir,
        [PageRange(1, 2), PageRange(3, 4), PageRange(5, 5)],
    )

    assert [part.name for part in parts] == [
        "part_001_pages_001-002.pdf",
        "part_002_pages_003-004.pdf",
        "part_003_pages_005-005.pdf",
    ]
    assert [len(PdfReader(str(part)).pages) for part in parts] == [2, 2, 1]


def test_split_pdf_by_range_rejects_end_page_beyond_document(tmp_path):
    source = write_pdf(tmp_path / "source.pdf", 2)
    output_dir = tmp_path / "parts"
    output_dir.mkdir()

    with pytest.raises(PdfProcessingError, match="End page cannot be greater"):
        split_pdf_by_range(source, output_dir, start_page=1, end_page=3, parts=1)


def test_merge_requires_at_least_two_files(tmp_path):
    source = write_pdf(tmp_path / "source.pdf", 1)

    with pytest.raises(PdfProcessingError):
        merge_pdf_files([source], tmp_path / "merged.pdf")


def test_zip_files_writes_archive(tmp_path):
    first = write_pdf(tmp_path / "page_001.pdf", 1)
    second = write_pdf(tmp_path / "page_002.pdf", 1)
    output = tmp_path / "pages.zip"

    zip_files([first, second], output)

    with ZipFile(output) as archive:
        assert archive.namelist() == ["page_001.pdf", "page_002.pdf"]

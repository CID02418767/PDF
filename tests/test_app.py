import json
from io import BytesIO
from zipfile import ZipFile

from fastapi.testclient import TestClient
from pypdf import PdfReader, PdfWriter

from app.main import app


client = TestClient(app)


def make_pdf(page_count: int) -> bytes:
    buffer = BytesIO()
    writer = PdfWriter()

    for _ in range(page_count):
        writer.add_blank_page(width=72, height=72)

    writer.write(buffer)
    return buffer.getvalue()


def test_merge_endpoint_combines_uploaded_pdfs():
    response = client.post(
        "/merge",
        files=[
            ("files", ("one.pdf", make_pdf(1), "application/pdf")),
            ("files", ("two.pdf", make_pdf(2), "application/pdf")),
        ],
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(PdfReader(BytesIO(response.content)).pages) == 3


def test_split_endpoint_returns_explicit_ranges_as_requested_parts():
    response = client.post(
        "/split",
        data={
            "parts": "3",
            "ranges": json.dumps(
                [
                    {"start": 1, "end": 2},
                    {"start": 3, "end": 4},
                    {"start": 5, "end": 5},
                ]
            ),
        },
        files={"file": ("five.pdf", make_pdf(5), "application/pdf")},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

    with ZipFile(BytesIO(response.content)) as archive:
        names = archive.namelist()
        first_part = archive.read(names[0])
        second_part = archive.read(names[1])
        third_part = archive.read(names[2])

    assert names == [
        "part_001_pages_001-002.pdf",
        "part_002_pages_003-004.pdf",
        "part_003_pages_005-005.pdf",
    ]
    assert len(PdfReader(BytesIO(first_part)).pages) == 2
    assert len(PdfReader(BytesIO(second_part)).pages) == 2
    assert len(PdfReader(BytesIO(third_part)).pages) == 1


def test_split_endpoint_fallback_creates_selected_range_and_remaining_pages():
    response = client.post(
        "/split",
        data={"start_page": "2", "end_page": "3", "parts": "2"},
        files={"file": ("five.pdf", make_pdf(5), "application/pdf")},
    )

    assert response.status_code == 200

    with ZipFile(BytesIO(response.content)) as archive:
        names = archive.namelist()
        selected = archive.read(names[0])
        remaining = archive.read(names[1])

    assert names == ["part_001_pages_002-003.pdf", "part_002_pages_001-005.pdf"]
    assert len(PdfReader(BytesIO(selected)).pages) == 2
    assert len(PdfReader(BytesIO(remaining)).pages) == 3


def test_split_endpoint_requires_matching_range_count():
    response = client.post(
        "/split",
        data={"parts": "3", "ranges": json.dumps([{"start": 1, "end": 2}])},
        files={"file": ("three.pdf", make_pdf(3), "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Number of page ranges must match the number of parts."


def test_non_pdf_upload_is_rejected():
    response = client.post(
        "/split",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only files ending in .pdf are accepted."

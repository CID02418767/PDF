import { useState } from "react";
import FileDropzone from "../../components/FileDropzone.jsx";
import StatusMessage from "../../components/StatusMessage.jsx";
import { downloadBytes, extractPdfPages, formatFileSize, getPdfPageCount, isPdfFile } from "./pdfUtils.js";
import { parsePageRanges } from "./pageRangeParser.js";

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [rangeInput, setRangeInput] = useState("");
  const [extractedBytes, setExtractedBytes] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFile(nextFiles) {
    const nextFile = nextFiles[0];
    setError("");
    setStatus("");
    setExtractedBytes(null);
    setPageCount(null);

    if (!isPdfFile(nextFile)) {
      setFile(null);
      setError("Choose a valid PDF file.");
      return;
    }

    setFile(nextFile);
    setIsLoadingFile(true);
    try {
      const count = await getPdfPageCount(nextFile);
      setPageCount(count);
      setStatus(`Loaded ${count} page${count === 1 ? "" : "s"}.`);
    } catch (loadError) {
      setFile(null);
      setError(loadError.message || "Could not read this PDF file.");
    } finally {
      setIsLoadingFile(false);
    }
  }

  async function handleExtract() {
    setError("");
    setStatus("");
    setExtractedBytes(null);

    if (!file || !pageCount) {
      setError("Upload a PDF before extracting pages.");
      return;
    }

    let pages;
    try {
      pages = parsePageRanges(rangeInput, pageCount);
    } catch (rangeError) {
      setError(rangeError.message);
      return;
    }

    setIsProcessing(true);
    try {
      const bytes = await extractPdfPages(file, pages);
      setExtractedBytes(bytes);
      setStatus(`Extracted ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
    } catch (extractError) {
      setError(extractError.message || "Could not extract pages from this PDF.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="pdf-panel">
      <div className="panel-heading">
        <p className="card-meta">No upload required</p>
        <h2>Split / Extract Pages</h2>
        <p>Enter pages like 1, 1-3, 1,3,5, or 1-3,6,8-10.</p>
      </div>

      <FileDropzone label="Choose or drop one PDF file" onFiles={handleFile} />

      {file ? (
        <div className="file-summary">
          <strong>{file.name}</strong>
          <span>{formatFileSize(file.size)}</span>
          {pageCount ? <span>{pageCount} pages</span> : null}
        </div>
      ) : (
        <p className="empty-state">No PDF selected yet.</p>
      )}

      <label className="range-input">
        Page ranges
        <input
          placeholder="Example: 1-3,6,8-10"
          type="text"
          value={rangeInput}
          onChange={(event) => {
            setRangeInput(event.target.value);
            setExtractedBytes(null);
          }}
        />
      </label>

      <StatusMessage type="info">{isLoadingFile ? "Reading PDF page count..." : ""}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{status}</StatusMessage>

      <div className="button-row">
        <button
          className="primary-button"
          type="button"
          disabled={isProcessing || isLoadingFile || !file}
          onClick={handleExtract}
        >
          {isProcessing ? "Extracting..." : "Extract pages"}
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={!file && !rangeInput}
          onClick={() => {
            setFile(null);
            setPageCount(null);
            setRangeInput("");
            setExtractedBytes(null);
            setError("");
            setStatus("");
          }}
        >
          Reset
        </button>
        {extractedBytes ? (
          <button
            className="download-button"
            type="button"
            onClick={() => downloadBytes(extractedBytes, "extracted-pages.pdf")}
          >
            Download extracted-pages.pdf
          </button>
        ) : null}
      </div>
    </section>
  );
}

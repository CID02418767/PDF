import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import FileDropzone from "../../components/FileDropzone.jsx";
import StatusMessage from "../../components/StatusMessage.jsx";
import { downloadBytes, formatFileSize, isPdfFile, mergePdfs, warnIfLarge } from "./pdfUtils.js";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedBytes, setMergedBytes] = useState(null);
  const warning = useMemo(() => warnIfLarge(files), [files]);

  function addFiles(nextFiles) {
    const validFiles = nextFiles.filter(isPdfFile);
    setError(validFiles.length === nextFiles.length ? "" : "Only PDF files can be added.");
    setFiles((current) => [...current, ...validFiles]);
    setMergedBytes(null);
    setStatus("");
  }

  function moveFile(index, direction) {
    setFiles((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return current;
      }
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMergedBytes(null);
  }

  function removeFile(index) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setMergedBytes(null);
  }

  async function handleMerge() {
    setError("");
    setStatus("");
    setMergedBytes(null);

    if (files.length < 2) {
      setError("Choose at least two PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    try {
      const bytes = await mergePdfs(files);
      setMergedBytes(bytes);
      setStatus("Merged PDF is ready.");
    } catch (mergeError) {
      setError(mergeError.message || "Could not merge these PDF files.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="pdf-panel">
      <div className="panel-heading">
        <p className="card-meta">Local browser processing</p>
        <h2>Merge PDFs</h2>
        <p>Select, reorder, remove, and merge PDF files without uploading them.</p>
      </div>

      <FileDropzone label="Choose or drop PDF files" multiple onFiles={addFiles} />

      {files.length > 0 ? (
        <ol className="file-list">
          {files.map((file, index) => (
            <li className="file-row" key={`${file.name}-${file.size}-${index}`}>
              <div>
                <strong>{file.name}</strong>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="row-actions">
                <button type="button" title="Move up" disabled={index === 0} onClick={() => moveFile(index, -1)}>
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={index === files.length - 1}
                  onClick={() => moveFile(index, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button type="button" title="Remove" onClick={() => removeFile(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">No PDFs selected yet.</p>
      )}

      <StatusMessage type="warning">{warning}</StatusMessage>
      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{status}</StatusMessage>

      <div className="button-row">
        <button className="primary-button" type="button" disabled={isProcessing || files.length < 2} onClick={handleMerge}>
          {isProcessing ? "Merging..." : "Merge PDFs"}
        </button>
        <button className="secondary-button" type="button" disabled={files.length === 0} onClick={() => setFiles([])}>
          Clear
        </button>
        {mergedBytes ? (
          <button className="download-button" type="button" onClick={() => downloadBytes(mergedBytes, "merged.pdf")}>
            Download merged.pdf
          </button>
        ) : null}
      </div>
    </section>
  );
}

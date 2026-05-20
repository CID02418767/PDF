import { UploadCloud } from "lucide-react";
import { useState } from "react";

export default function FileDropzone({ label, multiple = false, onFiles, accept = "application/pdf,.pdf" }) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length > 0) {
      onFiles(multiple ? files : files.slice(0, 1));
    }
  }

  return (
    <label
      className={isDragging ? "dropzone dragging" : "dropzone"}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <UploadCloud size={24} aria-hidden="true" />
      <span>{label}</span>
      <small>Drop PDF files here or click to browse</small>
      <input
        accept={accept}
        multiple={multiple}
        type="file"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}

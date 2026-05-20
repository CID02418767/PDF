import { PDFDocument } from "pdf-lib";

export function isPdfFile(file) {
  return file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function warnIfLarge(files) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  return totalBytes > 75 * 1024 * 1024
    ? "These PDFs are large. Browser processing may be slower and could use significant memory."
    : "";
}

export async function getPdfPageCount(file) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}

export async function mergePdfs(files) {
  const outputPdf = await PDFDocument.create();

  for (const file of files) {
    const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const copiedPages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((page) => outputPdf.addPage(page));
  }

  return outputPdf.save();
}

export async function extractPdfPages(file, pageNumbers) {
  const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const outputPdf = await PDFDocument.create();
  const zeroBasedIndexes = pageNumbers.map((pageNumber) => pageNumber - 1);
  const copiedPages = await outputPdf.copyPages(sourcePdf, zeroBasedIndexes);

  copiedPages.forEach((page) => outputPdf.addPage(page));
  return outputPdf.save();
}

export function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

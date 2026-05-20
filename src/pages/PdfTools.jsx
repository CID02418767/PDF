import MergePdf from "../tools/pdf/MergePdf.jsx";
import SplitPdf from "../tools/pdf/SplitPdf.jsx";

export default function PdfTools() {
  return (
    <div className="page-stack">
      <section className="section-header">
        <p className="eyebrow">Browser-only PDF tools</p>
        <h1>PDF Tools</h1>
        <p>Your PDF files are processed locally in your browser and are not uploaded to any server.</p>
      </section>

      <div className="pdf-tool-grid">
        <MergePdf />
        <SplitPdf />
      </div>
    </div>
  );
}

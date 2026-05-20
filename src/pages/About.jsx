export default function About() {
  return (
    <div className="page-stack">
      <section className="section-header">
        <p className="eyebrow">About this hub</p>
        <h1>Made for small useful things.</h1>
        <p>
          This site is a personal tool hub for practical browser-based apps. It is designed to be
          easy to share with friends while keeping sensitive files local whenever possible.
        </p>
      </section>

      <section className="info-panel">
        <h2>Local-first by default</h2>
        <p>
          The PDF module uses browser APIs and `pdf-lib`, so documents are handled on your device.
          Static hosting can serve the app, but the PDF contents do not need to leave the browser.
        </p>
      </section>
    </div>
  );
}

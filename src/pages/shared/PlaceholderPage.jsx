export default function PlaceholderPage({ title, description, ideas }) {
  return (
    <div className="page-stack">
      <section className="section-header">
        <p className="eyebrow">Tool category</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="placeholder-grid">
        {ideas.map((idea) => (
          <article className="placeholder-card" key={idea}>
            <h3>{idea}</h3>
            <p>Planned as a small, focused browser tool.</p>
          </article>
        ))}
      </section>
    </div>
  );
}

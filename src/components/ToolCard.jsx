export default function ToolCard({ title, description, actionLabel, onAction, meta }) {
  return (
    <article className="tool-card">
      <div>
        {meta ? <p className="card-meta">{meta}</p> : null}
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actionLabel ? (
        <button className="secondary-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

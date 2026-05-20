import ToolCard from "../components/ToolCard.jsx";

const sections = [
  {
    title: "PDF Tools",
    description: "Merge PDFs, reorder files, and extract selected pages without uploading private files.",
    actionLabel: "Open PDF tools",
    target: "pdf",
    meta: "Available now",
  },
  {
    title: "Text Tools",
    description: "A future home for cleanup, formatting, summaries, and study note helpers.",
    actionLabel: "Preview section",
    target: "text",
    meta: "Coming soon",
  },
  {
    title: "Study Tools",
    description: "Small utilities for planning, reviewing, and turning messy notes into useful structure.",
    actionLabel: "Preview section",
    target: "study",
    meta: "Coming soon",
  },
  {
    title: "Physics Tools",
    description: "Future calculators and visual explainers for formulas such as \\(F = ma\\) and energy problems.",
    actionLabel: "Preview section",
    target: "physics",
    meta: "Coming soon",
  },
];

export default function Home({ onNavigate }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <p className="eyebrow">Personal productivity lab</p>
        <h1>Small web tools for study, productivity, and everyday use.</h1>
        <p>
          A clean local-first hub for the little apps that make work easier for me and my friends.
        </p>
      </section>

      <section className="tool-grid" aria-label="Tool categories">
        {sections.map((section) => (
          <ToolCard
            key={section.title}
            {...section}
            onAction={() => onNavigate(section.target)}
          />
        ))}
      </section>
    </div>
  );
}

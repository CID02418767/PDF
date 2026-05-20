import { BookOpen, FileText, Home, Image, Info, PenTool, Sigma } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "pdf", label: "PDF Tools", icon: FileText },
  { id: "text", label: "Text Tools", icon: PenTool },
  { id: "image", label: "Image Tools", icon: Image },
  { id: "study", label: "Study Tools", icon: BookOpen },
  { id: "physics", label: "Physics Tools", icon: Sigma },
  { id: "about", label: "About", icon: Info },
];

export default function Navbar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => onNavigate("home")}>
        <span className="brand-mark">VH</span>
        <span>
          <strong>Vibe Hub</strong>
          <small>Personal tools</small>
        </span>
      </button>

      <nav className="nav-list" aria-label="Primary navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={activePage === id ? "nav-item active" : "nav-item"}
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

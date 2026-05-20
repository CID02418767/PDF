import Navbar from "./Navbar.jsx";

export default function Layout({ activePage, onNavigate, children }) {
  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={onNavigate} />
      <main className="main-content">{children}</main>
    </div>
  );
}

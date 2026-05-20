import { useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import PdfTools from "./pages/PdfTools.jsx";
import TextTools from "./pages/TextTools.jsx";
import ImageTools from "./pages/ImageTools.jsx";
import StudyTools from "./pages/StudyTools.jsx";
import PhysicsTools from "./pages/PhysicsTools.jsx";
import About from "./pages/About.jsx";

const routes = {
  home: Home,
  pdf: PdfTools,
  text: TextTools,
  image: ImageTools,
  study: StudyTools,
  physics: PhysicsTools,
  about: About,
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const Page = useMemo(() => routes[activePage] ?? Home, [activePage]);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      <Page onNavigate={setActivePage} />
    </Layout>
  );
}

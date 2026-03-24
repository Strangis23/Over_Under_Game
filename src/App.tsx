import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { CategoryPage } from "./components/CategoryPage";
import { GameScreen } from "./components/GameScreen";
import { HighScoresPage } from "./components/HighScoresPage";
import { HomePage } from "./components/HomePage";
import { CategoryThemeProvider } from "./theme/CategoryThemeProvider";
import "./App.css";

function PlayRoute() {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  if (!subcategoryId) {
    return <Navigate to="/" replace />;
  }
  return <GameScreen key={subcategoryId} subcategoryId={subcategoryId} />;
}

function routerBasename(): string | undefined {
  const raw = import.meta.env.BASE_URL.replace(/\/$/, "");
  return raw === "" ? undefined : raw;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <CategoryThemeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/play/:subcategoryId" element={<PlayRoute />} />
          <Route path="/scores" element={<HighScoresPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CategoryThemeProvider>
    </BrowserRouter>
  );
}

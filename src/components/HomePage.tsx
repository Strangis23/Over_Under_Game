import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { indexData } from "../data/loadDecks";

function matchesQuery(
  q: string,
  label: string,
  description: string,
  subLabels: string[],
): boolean {
  const s = q.trim().toLowerCase();
  if (!s) {
    return true;
  }
  const blob = `${label} ${description} ${subLabels.join(" ")}`.toLowerCase();
  return blob.includes(s);
}

export function HomePage() {
  const [query, setQuery] = useState("");

  const visibleCategories = useMemo(() => {
    if (!query.trim()) {
      return indexData.categories;
    }
    return indexData.categories.filter((cat) =>
      matchesQuery(
        query,
        cat.label,
        cat.description,
        cat.subcategories.map((sub) => sub.label),
      ),
    );
  }, [query]);

  return (
    <div className="page">
      <header className="hero">
        <h1>Over / Under</h1>
        <p className="lede">
          For each pair, pick which side has the <strong>higher</strong> or{" "}
          <strong>lower</strong> value for the stat — tap{" "}
          <strong>first</strong> or <strong>second</strong>.
        </p>
        <label className="home-search-label">
          <span className="visually-hidden">Filter categories</span>
          <input
            type="search"
            className="home-search-input"
            placeholder="Filter categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
      </header>
      <section className="card-grid">
        {visibleCategories.length === 0 ? (
          <p className="muted">No categories match that filter.</p>
        ) : (
          visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              className={`card card-link card-theme-${cat.id}`}
              to={`/category/${cat.id}`}
            >
              <h2>{cat.label}</h2>
              <p>{cat.description}</p>
            </Link>
          ))
        )}
      </section>
      <nav className="footer-nav">
        <Link to="/scores">High scores</Link>
      </nav>
    </div>
  );
}

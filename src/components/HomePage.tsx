import { Link } from "react-router-dom";
import { indexData } from "../data/loadDecks";

export function HomePage() {
  return (
    <div className="page">
      <header className="hero">
        <h1>Over / Under</h1>
        <p className="lede">
          For each pair, pick which side has the <strong>higher</strong> value
          for the stat — tap <strong>first</strong> or <strong>second</strong>.
        </p>
      </header>
      <section className="card-grid">
        {indexData.categories.map((cat) => (
          <Link
            key={cat.id}
            className={`card card-link card-theme-${cat.id}`}
            to={`/category/${cat.id}`}
          >
            <h2>{cat.label}</h2>
            <p>{cat.description}</p>
          </Link>
        ))}
      </section>
      <nav className="footer-nav">
        <Link to="/scores">High scores</Link>
      </nav>
    </div>
  );
}

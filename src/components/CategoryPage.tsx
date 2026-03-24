import { Link, useParams } from "react-router-dom";
import { indexData } from "../data/loadDecks";

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = indexData.categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="page">
        <p>Category not found.</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <Link className="back" to="/">
          ← Home
        </Link>
        <h1>{category.label}</h1>
        <p className="muted">{category.description}</p>
      </header>
      <section className="card-grid">
        {category.subcategories.map((sub) => (
          <Link
            key={sub.id}
            className="card card-link"
            to={`/play/${sub.id}`}
          >
            <h2>{sub.label}</h2>
            <p>{sub.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

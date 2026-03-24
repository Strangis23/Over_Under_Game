import { Link } from "react-router-dom";
import {
  useAllSubcategoryScores,
  useGlobalScores,
  useResetAllScores,
} from "../hooks/useHighScores";

export function HighScoresPage() {
  const rows = useAllSubcategoryScores();
  const global = useGlobalScores();
  const resetAll = useResetAllScores();

  return (
    <div className="page">
      <header className="page-header">
        <Link className="back" to="/">
          ← Home
        </Link>
        <h1>High scores</h1>
        <p className="muted">
          Stored on this device only. Best streak and total correct answers per
          mode.
        </p>
      </header>

      <section className="scores-global card">
        <h2>All modes (combined)</h2>
        <dl className="stats">
          <div>
            <dt>Best streak</dt>
            <dd>{global.bestStreak}</dd>
          </div>
          <div>
            <dt>Total correct</dt>
            <dd>{global.totalCorrect}</dd>
          </div>
        </dl>
      </section>

      <section className="scores-table-wrap">
        <table className="scores-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Mode</th>
              <th>Best streak</th>
              <th>Total correct</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.subcategoryId}>
                <td>{r.categoryLabel}</td>
                <td>{r.label}</td>
                <td>{r.scores.bestStreak}</td>
                <td>{r.scores.totalCorrect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="danger-zone">
        <button type="button" className="btn btn-danger" onClick={resetAll}>
          Reset all scores
        </button>
      </div>
    </div>
  );
}

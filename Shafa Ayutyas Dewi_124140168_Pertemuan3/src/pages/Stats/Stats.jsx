import { useBooks } from '../../context/BookContext';
import useBookStats from '../../hooks/useBookStats';
import './Stats.css';

export default function Stats() {
  const { books } = useBooks();
  const stats = useBookStats(books);
  const items = [
    ['Total buku', stats.total], ['Milik', stats.milik],
    ['Sedang dibaca', stats.baca], ['Ingin dibeli', stats.beli],
  ];
  return (
    <section className="panel">
      <h2>Statistik koleksi</h2>
      <dl className="stats">
        {items.map(([label, n]) => (
          <div key={label}><dt>{label}</dt><dd>{n}</dd></div>
        ))}
      </dl>
    </section>
  );
}

import PropTypes from 'prop-types';
import { statusLabel } from '../../constants';
import './BookList.css';

/** Daftar buku; menampilkan pesan kosong bila tidak ada data. */
export default function BookList({ books, onEdit, onDelete }) {
  if (books.length === 0) {
    return <p className="empty">Belum ada buku yang cocok. Tambahkan buku lewat form di atas.</p>;
  }
  return (
    <ul className="book-list">
      {books.map((book) => (
        <li key={book.id} className="book-item">
          <div>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
          </div>
          <span className={`badge badge-${book.status}`}>{statusLabel(book.status)}</span>
          <div className="actions">
            <button className="secondary" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}>Edit</button>
            <button className="danger" onClick={() => onDelete(book.id)} aria-label={`Hapus ${book.title}`}>Hapus</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

BookList.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

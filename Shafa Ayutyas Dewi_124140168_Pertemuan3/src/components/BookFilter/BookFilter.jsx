import PropTypes from 'prop-types';
import { STATUSES } from '../../constants';
import './BookFilter.css';

/** Pencarian (judul/penulis) dan filter status. */
export default function BookFilter({ status, search, onStatusChange, onSearchChange }) {
  return (
    <div className="book-filter">
      <input type="search" placeholder="Cari judul atau penulis…" aria-label="Cari buku"
        value={search} onChange={(e) => onSearchChange(e.target.value)} />
      <select aria-label="Filter status" value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="semua">Semua status</option>
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}

BookFilter.propTypes = {
  status: PropTypes.string.isRequired,
  search: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

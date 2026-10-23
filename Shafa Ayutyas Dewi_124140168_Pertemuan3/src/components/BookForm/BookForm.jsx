import { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUSES } from '../../constants';
import './BookForm.css';

const EMPTY = { title: '', author: '', status: 'milik' };

/** Form tambah/edit buku dengan validasi kolom wajib + feedback visual. */
export default function BookForm({ initialValues, submitLabel = 'Tambah buku', onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // hapus error saat user mengetik
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (!values.title.trim()) found.title = 'Judul wajib diisi';
    if (!values.author.trim()) found.author = 'Penulis wajib diisi';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({ title: values.title.trim(), author: values.author.trim(), status: values.status });
    if (!initialValues) setValues(EMPTY); // kosongkan form setelah menambah
  };

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="title">Judul</label>
        <input id="title" name="title" value={values.title} onChange={handleChange}
          className={errors.title ? 'invalid' : ''} aria-invalid={Boolean(errors.title)} />
        {errors.title && <span className="error" role="alert">{errors.title}</span>}
      </div>
      <div className="field">
        <label htmlFor="author">Penulis</label>
        <input id="author" name="author" value={values.author} onChange={handleChange}
          className={errors.author ? 'invalid' : ''} aria-invalid={Boolean(errors.author)} />
        {errors.author && <span className="error" role="alert">{errors.author}</span>}
      </div>
      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={values.status} onChange={handleChange}>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="actions">
        <button type="submit">{submitLabel}</button>
        {onCancel && <button type="button" className="secondary" onClick={onCancel}>Batal</button>}
      </div>
    </form>
  );
}

BookForm.propTypes = {
  initialValues: PropTypes.shape({ title: PropTypes.string, author: PropTypes.string, status: PropTypes.string }),
  submitLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};


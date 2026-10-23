import { useState } from 'react';
import { useBooks } from '../../context/BookContext';
import BookForm from '../../components/BookForm/BookForm';
import BookFilter from '../../components/BookFilter/BookFilter';
import BookList from '../../components/BookList/BookList';
import './Home.css';

export default function Home() {
  const { filteredBooks, statusFilter, setStatusFilter, search, setSearch, addBook, updateBook, deleteBook } = useBooks();
  const [editing, setEditing] = useState(null); // buku yang sedang diedit (null = mode tambah)

  const handleSubmit = (data) => {
    if (editing) {
      updateBook(editing.id, data);
      setEditing(null);
    } else {
      addBook(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus buku ini?')) {
      deleteBook(id);
      if (editing?.id === id) setEditing(null);
    }
  };

  return (
    <>
      <section className="panel">
        <h2>{editing ? 'Edit buku' : 'Tambah buku'}</h2>
        {/* key memaksa form di-reset ketika berpindah antar buku yang diedit */}
        <BookForm key={editing?.id ?? 'new'} initialValues={editing ?? undefined}
          submitLabel={editing ? 'Simpan perubahan' : 'Tambah buku'}
          onSubmit={handleSubmit} onCancel={editing ? () => setEditing(null) : undefined} />
      </section>
      <BookFilter status={statusFilter} search={search} onStatusChange={setStatusFilter} onSearchChange={setSearch} />
      <BookList books={filteredBooks} onEdit={setEditing} onDelete={handleDelete} />
    </>
  );
}

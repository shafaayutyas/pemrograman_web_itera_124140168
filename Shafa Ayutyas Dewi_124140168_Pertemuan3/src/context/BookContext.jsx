import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useLocalStorage from '../hooks/useLocalStorage';

const BookContext = createContext(null);

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

/** Provider: menyimpan semua state buku, filter, dan pencarian (Context API). */
export function BookProvider({ children }) {
  const [books, setBooks] = useLocalStorage('books', []);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [search, setSearch] = useState('');

  const addBook = useCallback((data) => setBooks((prev) => [{ id: newId(), ...data }, ...prev]), [setBooks]);
  const updateBook = useCallback(
    (id, data) => setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b))),
    [setBooks]
  );
  const deleteBook = useCallback((id) => setBooks((prev) => prev.filter((b) => b.id !== id)), [setBooks]);

  // Buku yang tampil = hasil filter status + pencarian judul/penulis
  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter(
      (b) =>
        (statusFilter === 'semua' || b.status === statusFilter) &&
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    );
  }, [books, statusFilter, search]);

  const value = { books, filteredBooks, statusFilter, setStatusFilter, search, setSearch, addBook, updateBook, deleteBook };
  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}
BookProvider.propTypes = { children: PropTypes.node.isRequired };

export function useBooks() {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error('useBooks harus dipakai di dalam BookProvider');
  return ctx;
}

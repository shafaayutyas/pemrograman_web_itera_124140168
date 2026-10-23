import { useMemo } from 'react';

/** Custom hook #2: menghitung statistik dari daftar buku. */
export default function useBookStats(books) {
  return useMemo(() => {
    const count = (status) => books.filter((b) => b.status === status).length;
    return { total: books.length, milik: count('milik'), baca: count('baca'), beli: count('beli') };
  }, [books]);
}

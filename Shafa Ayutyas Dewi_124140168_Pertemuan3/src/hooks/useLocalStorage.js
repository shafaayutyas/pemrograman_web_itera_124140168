import { useEffect, useState } from 'react';

/**
 * Custom hook #1: state yang otomatis tersimpan di localStorage.
 * - Nilai awal dibaca dari localStorage (lazy initializer useState).
 * - useEffect menyimpan ulang setiap nilai berubah.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue; // data rusak / storage tidak tersedia
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* abaikan: storage penuh atau diblokir */
    }
  }, [key, value]);

  return [value, setValue];
}

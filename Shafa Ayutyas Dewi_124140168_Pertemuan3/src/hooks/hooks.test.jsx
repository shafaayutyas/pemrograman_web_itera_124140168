import { act, renderHook } from '@testing-library/react';
import useBookStats from './useBookStats';
import useLocalStorage from './useLocalStorage';

describe('useBookStats', () => {
  it('menghitung total dan jumlah per status', () => {
    const books = [{ status: 'milik' }, { status: 'milik' }, { status: 'baca' }, { status: 'beli' }];
    const { result } = renderHook(() => useBookStats(books));
    expect(result.current).toEqual({ total: 4, milik: 2, baca: 1, beli: 1 });
  });
});

describe('useLocalStorage', () => {
  it('menyimpan nilai ke localStorage saat berubah', () => {
    const { result } = renderHook(() => useLocalStorage('k', []));
    act(() => result.current[1](['a']));
    expect(JSON.parse(localStorage.getItem('k'))).toEqual(['a']);
  });

  it('membaca nilai awal dari localStorage', () => {
    localStorage.setItem('k2', JSON.stringify({ x: 1 }));
    const { result } = renderHook(() => useLocalStorage('k2', null));
    expect(result.current[0]).toEqual({ x: 1 });
  });
});

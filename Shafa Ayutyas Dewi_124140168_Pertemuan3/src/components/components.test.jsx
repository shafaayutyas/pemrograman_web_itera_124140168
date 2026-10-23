import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BookForm from './BookForm/BookForm';
import BookList from './BookList/BookList';
import BookFilter from './BookFilter/BookFilter';

describe('BookForm', () => {
  it('menampilkan error dan tidak submit jika kolom kosong', () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /tambah buku/i }));
    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Penulis wajib diisi')).toBeInTheDocument();
    expect(screen.getByLabelText('Judul')).toHaveClass('invalid');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('memanggil onSubmit dengan data valid', () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Judul'), { target: { value: 'Laskar Pelangi' } });
    fireEvent.change(screen.getByLabelText('Penulis'), { target: { value: 'Andrea Hirata' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'baca' } });
    fireEvent.click(screen.getByRole('button', { name: /tambah buku/i }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Laskar Pelangi', author: 'Andrea Hirata', status: 'baca' });
  });
});

describe('BookList', () => {
  const books = [{ id: '1', title: 'Bumi', author: 'Tere Liye', status: 'milik' }];

  it('menampilkan pesan kosong jika tidak ada buku', () => {
    render(<BookList books={[]} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/belum ada buku/i)).toBeInTheDocument();
  });

  it('memanggil onDelete dan onEdit', () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    render(<BookList books={books} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus Bumi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Bumi' }));
    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onEdit).toHaveBeenCalledWith(books[0]);
  });
});

describe('BookFilter', () => {
  it('memanggil callback saat status dan pencarian berubah', () => {
    const onStatusChange = vi.fn();
    const onSearchChange = vi.fn();
    render(<BookFilter status="semua" search="" onStatusChange={onStatusChange} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByLabelText('Filter status'), { target: { value: 'beli' } });
    fireEvent.change(screen.getByLabelText('Cari buku'), { target: { value: 'bumi' } });
    expect(onStatusChange).toHaveBeenCalledWith('beli');
    expect(onSearchChange).toHaveBeenCalledWith('bumi');
  });
});

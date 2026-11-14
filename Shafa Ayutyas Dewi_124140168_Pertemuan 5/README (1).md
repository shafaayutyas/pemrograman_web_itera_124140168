# Sistem Manajemen Perpustakaan Sederhana

## Identitas Mahasiswa

| | |
|---|---|
| **Nama Lengkap** | Shafa Ayutyas Dewi |
| **NIM** | 124140168 |
| **Kelas Praktikum** | RB |

## Deskripsi Program

Program ini adalah sistem manajemen perpustakaan sederhana berbasis konsep OOP Python.

### Struktur Berkas

| Berkas | Isi |
|---|---|
| `library_item.py` | Abstract class `LibraryItem(ABC)` serta subclass `Book` dan `Magazine` |
| `library.py` | Class `Library` yang mengelola koleksi item |
| `main.py` | Skrip uji yang menjalankan seluruh fitur |

### Alur Program

1. `main.py` membuat objek `Library`.
2. Beberapa `Book` dan `Magazine` ditambahkan ke perpustakaan (termasuk uji penambahan dengan id duplikat yang ditolak).
3. Katalog item yang tersedia ditampilkan.
4. Item dicari berdasarkan id (`cari_by_id`) dan berdasarkan judul (`cari_by_judul`).
5. Status ketersediaan didemonstrasikan: item dipinjam sehingga hilang dari katalog tersedia, lalu dikembalikan sehingga muncul kembali.
6. Polymorphism, abstract class, dan encapsulation didemonstrasikan di bagian akhir.

### Penerapan 4 Pilar OOP

**1. Class**
`LibraryItem`, `Book`, `Magazine`, dan `Library` adalah class yang masing-masing memiliki atribut dan method sendiri. Objek (misalnya `Book("B001", ...)`) dibuat dari class tersebut.

**2. Inheritance (dan Abstract Class)**
`LibraryItem` adalah abstract class (turunan `ABC`) dengan dua abstract method: `get_detail()` dan `hitung_denda()`. `Book` dan `Magazine` mewarisi `LibraryItem` dan wajib mengimplementasikan kedua method tersebut. `LibraryItem` sendiri tidak dapat diinstansiasi (menghasilkan `TypeError`). Atribut dan method umum seperti `pinjam()`, `kembalikan()`, dan `status` diwariskan, sehingga tidak ditulis ulang.

**3. Encapsulation**
- Atribut **protected** (`_item_id`, `_judul`, `_tahun_terbit`, `_penulis`, dst.) hanya untuk dipakai class dan turunannya.
- Atribut **private** `__dipinjam` pada `LibraryItem` dan `__koleksi` pada `Library` tidak dapat diakses langsung dari luar class. Perubahan hanya lewat method (`pinjam()`, `kembalikan()`, `tambah_item()`).
- **Property decorator** (`@property`) dipakai untuk `item_id`, `judul`, `is_dipinjam`, `status`, dan lainnya. `is_dipinjam` bersifat read-only, sehingga mencoba mengubahnya langsung menghasilkan `AttributeError`.

**4. Polymorphism**
Method `get_detail()` dan `hitung_denda()` memiliki perilaku berbeda pada tiap subclass: buku dendanya Rp1.000/hari, majalah Rp2.000/hari. `Library.tampilkan_katalog()` memanggil `print(item)` (yang memanggil `get_detail()`) pada semua item tanpa perlu tahu apakah itu buku atau majalah.

## Panduan Menjalankan Program

Pastikan Python 3 sudah terpasang, lalu jalankan dari folder yang berisi ketiga berkas:

```bash
python main.py
```

(Pada sebagian sistem, gunakan `python3 main.py`.)

## Screenshot Output

![Screenshot Output](screenshot(1).png)
![Screenshot Output](screenshot(2).png)


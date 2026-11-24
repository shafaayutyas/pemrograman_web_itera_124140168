# RESTful API Manajemen Mahasiswa dan Matakuliah

## 1. Identitas Mahasiswa

- Nama: Shafa Ayutyas Dewi
- NIM: 124140168
- Mata Kuliah: Pengembangan Aplikasi Website
- Kelas: RB

## 2. Deskripsi Proyek

Proyek ini merupakan implementasi RESTful API menggunakan Pyramid Framework dan PostgreSQL untuk mengelola data mahasiswa dan matakuliah.

API menyediakan operasi CRUD (Create, Read, Update, Delete) yang memungkinkan pengguna menambahkan, menampilkan, memperbarui, dan menghapus data melalui HTTP request dengan format JSON.

## 3. Teknologi yang Digunakan

- Python 3.15.2
- Pyramid Framework
- SQLAlchemy
- Alembic
- PostgreSQL 18
- Psycopg 3
- Waitress
- Pytest

## 4. Struktur Database

### Tabel mahasiswa

| Kolom | Tipe Data | Keterangan |
|---|---|---|
| id | Integer | Primary Key |
| nim | Text | Unique, Not Null |
| nama | Text | Not Null |
| jurusan | Text | Not Null |
| tanggal_lahir | Date | Nullable |
| alamat | Text | Nullable |

### Tabel matakuliah

| Kolom | Tipe Data | Keterangan |
|---|---|---|
| id | Integer | Primary Key |
| kode_mk | Text | Unique, Not Null |
| nama_mk | Text | Not Null |
| sks | Integer | Not Null |
| semester | Integer | Not Null |

## 5. Konfigurasi Database

Database yang digunakan adalah PostgreSQL dengan konfigurasi:

- Database: `pyramid_mahasiswa`
- Username: `pyramid_user`
- Host: `localhost`
- Port: `5432`

Konfigurasi koneksi pada `development.ini`:

```ini
sqlalchemy.url = postgresql+psycopg://pyramid_user:pyramid_pass@localhost:5432/pyramid_mahasiswa
```

## 6. Cara Menjalankan Proyek

### A. Mengaktifkan Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

### B. Menginstal Dependensi

```powershell
python -m pip install -e ".[testing]"
```

### C. Menjalankan Migration

```powershell
python -m alembic -c development.ini upgrade head
```

### D. Inisialisasi Database

```powershell
python -c "from pyramid_mahasiswa.scripts.initialize_db import main; main(['initialize_pyramid_mahasiswa_db', 'development.ini'])"
```

### E. Menjalankan Server

```powershell
python -c "import os; from paste.deploy import loadapp; from waitress import serve; app = loadapp('config:development.ini', relative_to=os.getcwd()); serve(app, host='127.0.0.1', port=6543)"
```

Server berjalan pada:

`http://127.0.0.1:6543`

## 7. Dokumentasi Endpoint API

### A. API Mahasiswa

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/mahasiswa` | Menampilkan seluruh mahasiswa |
| GET | `/api/mahasiswa/{id}` | Menampilkan detail mahasiswa |
| POST | `/api/mahasiswa` | Menambahkan mahasiswa |
| PUT | `/api/mahasiswa/{id}` | Memperbarui mahasiswa |
| DELETE | `/api/mahasiswa/{id}` | Menghapus mahasiswa |

### B. API Matakuliah

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/matakuliah` | Menampilkan seluruh matakuliah |
| GET | `/api/matakuliah/{id}` | Menampilkan detail matakuliah |
| POST | `/api/matakuliah` | Menambahkan matakuliah |
| PUT | `/api/matakuliah/{id}` | Memperbarui matakuliah |
| DELETE | `/api/matakuliah/{id}` | Menghapus matakuliah |

## 8. Contoh Request API Matakuliah

### POST - Menambahkan Matakuliah

Endpoint:

`POST /api/matakuliah`

Request JSON:

```json
{
    "kode_mk": "IF401",
    "nama_mk": "Data Mining",
    "sks": 3,
    "semester": 5
}
```

### PUT - Memperbarui Matakuliah

Endpoint:

`PUT /api/matakuliah/4`

Request JSON:

```json
{
    "nama_mk": "Data Mining Lanjut",
    "sks": 4
}
```

## 9. Validasi Data

API Matakuliah menerapkan validasi berikut:

1. Kode matakuliah wajib diisi dan tidak boleh duplikat.
2. Nama matakuliah wajib diisi.
3. SKS harus berupa bilangan bulat positif.
4. Semester harus berupa bilangan bulat positif.
5. ID yang tidak ditemukan menghasilkan HTTP 404.
6. Input yang tidak valid menghasilkan HTTP 400.

## 10. Hasil Pengujian

Pengujian dilakukan terhadap endpoint API menggunakan browser dan PowerShell.

### Pengujian CRUD Mahasiswa

| Pengujian | Hasil |
|---|---|
| GET seluruh mahasiswa | PASS |
| GET detail mahasiswa | PASS |
| POST mahasiswa | PASS |
| PUT mahasiswa | PASS |
| DELETE mahasiswa | PASS |

### Pengujian Otomatis

Perintah:

```powershell
python -m pytest
```

Hasil:

- 2 passed
- 0 failed
- 3 warnings

### Pengujian CRUD Matakuliah

Pengujian RESTful API Matakuliah dilakukan untuk memastikan seluruh operasi CRUD (Create, Read, Update, Delete) berjalan sesuai dengan fungsinya.

Pengujian dilakukan menggunakan browser dan PowerShell dengan mengirimkan HTTP request ke server Pyramid.

| No. | Method | Endpoint | Skenario Pengujian | Hasil |
|---|---|---|---|---|
| 1 | GET | `/api/matakuliah` | Menampilkan seluruh data matakuliah | PASS |
| 2 | GET | `/api/matakuliah/{id}` | Menampilkan detail matakuliah berdasarkan ID | PASS |
| 3 | POST | `/api/matakuliah` | Menambahkan data matakuliah baru | PASS |
| 4 | PUT | `/api/matakuliah/{id}` | Memperbarui data matakuliah | PASS |
| 5 | DELETE | `/api/matakuliah/{id}` | Menghapus data matakuliah | PASS |

**Catatan:** Status PASS hanya dicantumkan setelah masing-masing endpoint berhasil diuji.

### Pengujian Validasi

| No. | Skenario | Hasil yang Diharapkan |
|---|---|---|
| 1 | Menambahkan kode matakuliah duplikat | HTTP 400 Bad Request |
| 2 | Mengosongkan field wajib | HTTP 400 Bad Request |
| 3 | Memasukkan SKS negatif | HTTP 400 Bad Request |
| 4 | Mengakses ID matakuliah yang tidak tersedia | HTTP 404 Not Found |

### Kesimpulan Pengujian

Berdasarkan pengujian yang dilakukan, RESTful API Matakuliah diharapkan dapat menjalankan operasi CRUD serta melakukan validasi terhadap data yang diterima. Hasil akhir pengujian disesuaikan dengan hasil aktual pada aplikasi.

## 11. Dokumentasi Screenshot

Dokumentasi berikut merupakan bukti implementasi dan pengujian RESTful API Manajemen Mahasiswa dan Matakuliah menggunakan Pyramid Framework dan PostgreSQL.

### 11.1 Endpoint Mahasiswa

**Gambar 1. Get Semua Mahasiswa**

Menampilkan Daftar seluruh mahasiswa.

![Model Matakuliah](1.1.png)

**Gambar 2. GET detail mahasiswa**

Menampilkan Detail mahasiswa dengan ID 3.

![Model Matakuliah](1.2.png)

**Gambar 3. POST mahasiswa**

Menampilkan Data yang dikirim dan respons berhasil.

![Model Matakuliah](1.3.png)


**Gambar 4. PUT mahasiswa**

Menampilkan Data yang diperbarui dan respons berhasil

![Model Matakuliah](1.4.png)

**Gambar 5. DELETE mahasiswa**

Menampilkan Respons berhasil menghapus data.

![Model Matakuliah](1.5.png)

### 11.2 Endpoint Matakuliah

**Gambar 6. GET semua matakuliah**

Menampilkan Daftar seluruh matakuliah.

![Model Matakuliah](2.1.png)

**Gambar 7. GET detail matakuliah**

Menampilkan Detail matakuliah dengan ID 4.

![Model Matakuliah](2.2.png)

**Gambar 8. POST matakuliah**

Menampilkan Data yang dikirim dan respons berhasil.

![Model Matakuliah](2.3.png)

**Gambar 9. PUT matakuliah**

Menampilkan Data yang diperbarui dan respons berhasil.

![Model Matakuliah](2.4.png)

**Gambar 10. DELETE matakuliah**

Menampilkan Respons berhasil menghapus data.

![Model Matakuliah](2.5.png)


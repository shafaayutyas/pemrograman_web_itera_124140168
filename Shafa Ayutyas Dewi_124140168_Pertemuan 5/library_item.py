"""Modul berisi abstract class LibraryItem beserta subclass Book dan Magazine."""

from abc import ABC, abstractmethod


class LibraryItem(ABC):
    """Abstract class dasar untuk semua item di perpustakaan."""

    def __init__(self, item_id, judul, tahun_terbit):
        self._item_id = item_id          # protected: id item
        self._judul = judul              # protected: judul item
        self._tahun_terbit = tahun_terbit  # protected: tahun terbit
        self.__dipinjam = False          # private: status peminjaman

    # ---------- Properties (encapsulation) ----------
    @property
    def item_id(self):
        return self._item_id

    @property
    def judul(self):
        return self._judul

    @property
    def tahun_terbit(self):
        return self._tahun_terbit

    @property
    def is_dipinjam(self):
        """Status peminjaman (read-only dari luar class)."""
        return self.__dipinjam

    @property
    def status(self):
        return "Dipinjam" if self.__dipinjam else "Tersedia"

    # ---------- Perilaku umum ----------
    def pinjam(self):
        """Meminjam item. Mengembalikan True jika berhasil."""
        if self.__dipinjam:
            return False
        self.__dipinjam = True
        return True

    def kembalikan(self):
        """Mengembalikan item. Mengembalikan True jika berhasil."""
        if not self.__dipinjam:
            return False
        self.__dipinjam = False
        return True

    # ---------- Abstract methods (wajib di-override subclass) ----------
    @abstractmethod
    def get_detail(self):
        """Mengembalikan string detail item."""

    @abstractmethod
    def hitung_denda(self, hari_terlambat):
        """Menghitung denda keterlambatan (dalam Rupiah)."""

    def __str__(self):
        return f"[{self._item_id}] {self.get_detail()} - {self.status}"


class Book(LibraryItem):
    """Item perpustakaan berupa buku."""

    DENDA_PER_HARI = 1000

    def __init__(self, item_id, judul, tahun_terbit, penulis, jumlah_halaman):
        super().__init__(item_id, judul, tahun_terbit)
        self._penulis = penulis
        self._jumlah_halaman = jumlah_halaman

    @property
    def penulis(self):
        return self._penulis

    def get_detail(self):
        return (f"Buku: '{self._judul}' oleh {self._penulis} "
                f"({self._tahun_terbit}, {self._jumlah_halaman} hlm)")

    def hitung_denda(self, hari_terlambat):
        return max(0, hari_terlambat) * self.DENDA_PER_HARI


class Magazine(LibraryItem):
    """Item perpustakaan berupa majalah."""

    DENDA_PER_HARI = 2000

    def __init__(self, item_id, judul, tahun_terbit, edisi, penerbit):
        super().__init__(item_id, judul, tahun_terbit)
        self._edisi = edisi
        self._penerbit = penerbit

    @property
    def edisi(self):
        return self._edisi

    def get_detail(self):
        return (f"Majalah: '{self._judul}' edisi {self._edisi} "
                f"oleh {self._penerbit} ({self._tahun_terbit})")

    def hitung_denda(self, hari_terlambat):
        return max(0, hari_terlambat) * self.DENDA_PER_HARI

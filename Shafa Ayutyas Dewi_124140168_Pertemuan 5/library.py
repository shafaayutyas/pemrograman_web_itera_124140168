"""Modul berisi class Library yang mengelola koleksi LibraryItem."""

from library_item import LibraryItem


class Library:
    """Mengelola koleksi item perpustakaan."""

    def __init__(self, nama):
        self.nama = nama
        self.__koleksi = []  # private: daftar item perpustakaan

    def tambah_item(self, item):
        """Menambahkan item ke koleksi. ID harus unik."""
        if not isinstance(item, LibraryItem):
            raise TypeError("Item harus berupa turunan LibraryItem")
        if self.cari_by_id(item.item_id) is not None:
            print(f"Gagal: item dengan id '{item.item_id}' sudah ada.")
            return False
        self.__koleksi.append(item)
        print(f"Berhasil menambahkan: {item.judul}")
        return True

    def tampilkan_katalog(self, hanya_tersedia=True):
        """Menampilkan katalog. Default hanya item yang tersedia."""
        judul = "tersedia" if hanya_tersedia else "lengkap"
        print(f"\n=== Katalog {judul} - {self.nama} ===")
        daftar = [i for i in self.__koleksi
                  if not (hanya_tersedia and i.is_dipinjam)]
        if not daftar:
            print("(kosong)")
            return
        for item in daftar:  # polymorphism: get_detail() berbeda tiap subclass
            print(item)

    def cari_by_id(self, item_id):
        """Mencari item berdasarkan id. Mengembalikan item atau None."""
        for item in self.__koleksi:
            if item.item_id == item_id:
                return item
        return None

    def cari_by_judul(self, kata_kunci):
        """Mencari item berdasarkan judul (tidak case-sensitive)."""
        kata_kunci = kata_kunci.lower()
        return [i for i in self.__koleksi if kata_kunci in i.judul.lower()]

    def pinjam_item(self, item_id):
        item = self.cari_by_id(item_id)
        if item is None:
            print(f"Item '{item_id}' tidak ditemukan.")
            return False
        if item.pinjam():
            print(f"'{item.judul}' berhasil dipinjam.")
            return True
        print(f"'{item.judul}' sedang dipinjam.")
        return False

    def kembalikan_item(self, item_id):
        item = self.cari_by_id(item_id)
        if item is None:
            print(f"Item '{item_id}' tidak ditemukan.")
            return False
        if item.kembalikan():
            print(f"'{item.judul}' berhasil dikembalikan.")
            return True
        print(f"'{item.judul}' tidak sedang dipinjam.")
        return False

    def __len__(self):
        return len(self.__koleksi)

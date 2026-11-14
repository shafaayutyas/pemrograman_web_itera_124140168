"""Skrip uji sistem manajemen perpustakaan sederhana."""

from library import Library
from library_item import Book, Magazine, LibraryItem


def cetak_hasil(judul, hasil):
    print(f"\n{judul}")
    if not hasil:
        print("  Tidak ditemukan.")
    for item in hasil:
        print(f"  {item}")


def main():
    perpus = Library("Perpustakaan Kampus")

    # 1. Menambahkan item
    print("--- Menambahkan item ---")
    perpus.tambah_item(Book("B001", "Pemrograman Python", 2021, "Budi Santoso", 320))
    perpus.tambah_item(Book("B002", "Struktur Data", 2019, "Siti Aminah", 280))
    perpus.tambah_item(Magazine("M001", "Tech Today", 2024, "Edisi 45", "Media Teknologi"))
    perpus.tambah_item(Magazine("M002", "Sains Populer", 2023, "Edisi 12", "Ilmu Press"))
    perpus.tambah_item(Book("B001", "Duplikat", 2020, "Anonim", 100))  # id duplikat

    # 2. Menampilkan katalog
    perpus.tampilkan_katalog()

    # 3. Mencari item
    print("\n--- Pencarian ---")
    item = perpus.cari_by_id("B002")
    print(f"Cari id 'B002' : {item}")
    cetak_hasil("Cari judul 'python':", perpus.cari_by_judul("python"))
    cetak_hasil("Cari judul 'xyz':", perpus.cari_by_judul("xyz"))

    # 4. Status ketersediaan
    print("\n--- Status ketersediaan ---")
    perpus.pinjam_item("B001")
    perpus.pinjam_item("B001")  # sudah dipinjam
    perpus.tampilkan_katalog()  # B001 tidak muncul
    perpus.tampilkan_katalog(hanya_tersedia=False)
    perpus.kembalikan_item("B001")
    perpus.tampilkan_katalog()

    # 5. Polymorphism: hitung_denda berbeda per subclass
    print("\n--- Polymorphism: denda terlambat 3 hari ---")
    for kode in ("B001", "M001"):
        it = perpus.cari_by_id(kode)
        print(f"{it.judul}: Rp{it.hitung_denda(3):,}")

    # 6. Abstract class tidak dapat diinstansiasi
    print("\n--- Abstract class ---")
    try:
        LibraryItem("X", "X", 2000)
    except TypeError as e:
        print(f"TypeError: {e}")

    # 7. Encapsulation: status tidak bisa diubah langsung
    print("\n--- Encapsulation ---")
    try:
        item.is_dipinjam = True
    except AttributeError as e:
        print(f"AttributeError: {e}")


if __name__ == "__main__":
    main()

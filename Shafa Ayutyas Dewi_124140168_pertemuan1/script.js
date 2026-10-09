/* ==========================================================
   Mini POS - script.js
   Alur: validasi form -> simpan ke array keranjang ->
         simpan ke localStorage -> render tabel -> hitung total
   ========================================================== */

/* ---------- Konstanta ---------- */
const STORAGE_KEY = "miniPosKeranjang";
const MIN_NAMA = 3;
const MIN_HARGA = 500;
const MIN_QTY = 1;
const BATAS_DISKON = 50000;   // total minimal untuk diskon otomatis
const PERSEN_DISKON = 10;     // besar diskon (%)
const KODE_PROMO = "HEMAT10"; // kode promo yang valid

/* ---------- State aplikasi ---------- */
let keranjang = [];     // array of { nama, harga, qty }
let promoAktif = false; // true jika kode promo valid sudah dipakai

/* ---------- Referensi elemen DOM ---------- */
const formBarang   = document.getElementById("form-barang");
const inputNama    = document.getElementById("input-nama");
const inputHarga   = document.getElementById("input-harga");
const inputQty     = document.getElementById("input-qty");
const errorNama    = document.getElementById("error-nama");
const errorHarga   = document.getElementById("error-harga");
const errorQty     = document.getElementById("error-qty");

const tabelBody    = document.getElementById("tabel-keranjang");
const jumlahItem   = document.getElementById("jumlah-item");

const teksTotal      = document.getElementById("teks-total");
const teksDiskon     = document.getElementById("teks-diskon");
const labelDiskon    = document.getElementById("label-diskon");
const teksTotalAkhir = document.getElementById("teks-total-akhir");
const infoDiskon     = document.getElementById("info-diskon");

const inputPromo   = document.getElementById("input-promo");
const btnPromo     = document.getElementById("btn-promo");
const statusPromo  = document.getElementById("status-promo");

const inputBayar      = document.getElementById("input-bayar");
const kotakKembalian  = document.getElementById("kotak-kembalian");
const labelKembalian  = document.getElementById("label-kembalian");
const teksKembalian   = document.getElementById("teks-kembalian");
const catatanKembalian = document.getElementById("catatan-kembalian");

const btnReset = document.getElementById("btn-reset");

/* ==========================================================
   1. UTILITAS
   ========================================================== */

/** Ubah angka menjadi format Rupiah, contoh: 15000 -> "Rp 15.000" */
function formatRupiah(angka) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(angka);
}

/* ==========================================================
   2. LOCALSTORAGE
   ========================================================== */

/** Simpan array keranjang ke localStorage (serialisasi JSON.stringify) */
function simpanKeranjang() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keranjang));
  } catch (err) {
    console.error("Gagal menyimpan ke localStorage:", err);
  }
}

/** Muat keranjang dari localStorage (deserialisasi JSON.parse) */
function muatKeranjang() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const hasil = data ? JSON.parse(data) : [];
    keranjang = Array.isArray(hasil) ? hasil : [];
  } catch (err) {
    console.error("Data localStorage rusak, keranjang dikosongkan:", err);
    keranjang = [];
  }
}

/* ==========================================================
   3. VALIDASI FORM
   ========================================================== */

/** Tampilkan pesan error merah di bawah input */
function tampilkanError(input, elemenError, pesan) {
  input.classList.add("invalid");
  elemenError.textContent = pesan;
}

/** Hapus pesan error dari satu input */
function bersihkanError(input, elemenError) {
  input.classList.remove("invalid");
  elemenError.textContent = "";
}

/** Validasi nama barang: wajib diisi, minimal 3 karakter */
function validasiNama(nilai) {
  const nama = nilai.trim();
  if (nama === "") return "Nama barang wajib diisi.";
  if (nama.length < MIN_NAMA) return "Nama barang minimal " + MIN_NAMA + " karakter.";
  return "";
}

/** Validasi harga: wajib angka, minimal Rp 500 */
function validasiHarga(nilai) {
  if (nilai.trim() === "") return "Harga satuan wajib diisi.";
  const harga = Number(nilai);
  if (Number.isNaN(harga)) return "Harga satuan harus berupa angka.";
  if (harga < MIN_HARGA) return "Harga satuan minimal " + formatRupiah(MIN_HARGA) + ".";
  return "";
}

/** Validasi qty: wajib angka bulat, minimal 1 */
function validasiQty(nilai) {
  if (nilai.trim() === "") return "Jumlah wajib diisi.";
  const qty = Number(nilai);
  if (Number.isNaN(qty)) return "Jumlah harus berupa angka.";
  if (!Number.isInteger(qty)) return "Jumlah harus berupa bilangan bulat.";
  if (qty < MIN_QTY) return "Jumlah minimal " + MIN_QTY + ".";
  return "";
}

/**
 * Validasi seluruh form.
 * @returns {boolean} true jika semua input valid
 */
function validasiForm() {
  const pesanNama  = validasiNama(inputNama.value);
  const pesanHarga = validasiHarga(inputHarga.value);
  const pesanQty   = validasiQty(inputQty.value);

  pesanNama  ? tampilkanError(inputNama,  errorNama,  pesanNama)  : bersihkanError(inputNama,  errorNama);
  pesanHarga ? tampilkanError(inputHarga, errorHarga, pesanHarga) : bersihkanError(inputHarga, errorHarga);
  pesanQty   ? tampilkanError(inputQty,   errorQty,   pesanQty)   : bersihkanError(inputQty,   errorQty);

  return !pesanNama && !pesanHarga && !pesanQty;
}

/* ==========================================================
   4. KERANJANG: TAMBAH & HAPUS
   ========================================================== */

/** Tambahkan barang baru ke keranjang (dipanggil saat form valid) */
function tambahBarang() {
  keranjang.push({
    nama: inputNama.value.trim(),
    harga: Number(inputHarga.value),
    qty: Number(inputQty.value)
  });
  simpanKeranjang();
  tampilkanKeranjang();
}

/** Hapus satu barang berdasarkan index, lalu hitung ulang otomatis */
function hapusBarang(index) {
  keranjang.splice(index, 1);
  simpanKeranjang();
  tampilkanKeranjang();
}

/** Kosongkan keranjang dan localStorage (transaksi baru) */
function resetTransaksi() {
  if (keranjang.length > 0) {
    const yakin = confirm("Kosongkan keranjang dan mulai transaksi baru?");
    if (!yakin) return;
  }
  keranjang = [];
  promoAktif = false;
  localStorage.removeItem(STORAGE_KEY);

  inputPromo.value = "";
  inputBayar.value = "";
  setStatusPromo("", "");
  tampilkanKeranjang();
}

/* ==========================================================
   5. KALKULATOR
   ========================================================== */

/** Subtotal satu baris = harga satuan x qty */
function hitungSubtotal(item) {
  return item.harga * item.qty;
}

/** Total belanja = jumlah seluruh subtotal */
function hitungTotalBelanja() {
  return keranjang.reduce((total, item) => total + hitungSubtotal(item), 0);
}

/**
 * Hitung diskon 10% jika total >= Rp 50.000 ATAU kode promo aktif.
 * Diskon tidak ditumpuk (maksimal 10%).
 */
function hitungDiskon(total) {
  const dapatDiskonOtomatis = total >= BATAS_DISKON;
  if (total > 0 && (dapatDiskonOtomatis || promoAktif)) {
    return Math.round(total * PERSEN_DISKON / 100);
  }
  return 0;
}

/** Kembalian = uang bayar - total akhir (dihitung di tampilkanKembalian) */
function tampilkanKembalian(totalAkhir) {
  const teks = inputBayar.value.trim();
  kotakKembalian.classList.remove("ok", "kurang");

  // Belum ada input uang bayar
  if (teks === "") {
    labelKembalian.textContent = "Kembalian";
    teksKembalian.textContent = formatRupiah(0);
    catatanKembalian.textContent = "";
    return;
  }

  const uangBayar = Number(teks);

  if (totalAkhir === 0) {
    teksKembalian.textContent = formatRupiah(0);
    catatanKembalian.textContent = "Keranjang masih kosong.";
    return;
  }

  if (Number.isNaN(uangBayar) || uangBayar < 0) {
    teksKembalian.textContent = formatRupiah(0);
    catatanKembalian.textContent = "Nominal uang bayar tidak valid.";
    return;
  }

  const selisih = uangBayar - totalAkhir;

  if (selisih < 0) {
    kotakKembalian.classList.add("kurang");
    labelKembalian.textContent = "Kurang";
    teksKembalian.textContent = formatRupiah(Math.abs(selisih));
    catatanKembalian.textContent = "Uang belum mencukupi.";
  } else {
    kotakKembalian.classList.add("ok");
    labelKembalian.textContent = "Kembalian";
    teksKembalian.textContent = formatRupiah(selisih);
    catatanKembalian.textContent = selisih === 0 ? "Uang pas." : "Uang mencukupi.";
  }
}

/* ==========================================================
   6. KODE PROMO
   ========================================================== */

function setStatusPromo(pesan, jenis) {
  statusPromo.textContent = pesan;
  statusPromo.className = "promo-status" + (jenis ? " " + jenis : "");
}

function terapkanPromo() {
  const kode = inputPromo.value.trim().toUpperCase();
  if (kode === "") {
    promoAktif = false;
    setStatusPromo("Masukkan kode promo terlebih dahulu.", "bad");
  } else if (kode === KODE_PROMO) {
    promoAktif = true;
    setStatusPromo("Kode " + KODE_PROMO + " berhasil dipakai: diskon 10%.", "ok");
  } else {
    promoAktif = false;
    setStatusPromo("Kode promo tidak dikenal.", "bad");
  }
  tampilkanRingkasan();
}

/* ==========================================================
   7. RENDER TAMPILAN
   ========================================================== */

/** Gambar ulang tabel keranjang + ringkasan */
function tampilkanKeranjang() {
  tabelBody.innerHTML = "";

  if (keranjang.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "Keranjang masih kosong. Tambahkan barang lewat form di atas.";
    tr.appendChild(td);
    tabelBody.appendChild(tr);
  }

  keranjang.forEach(function (item, index) {
    const tr = document.createElement("tr");

    // Sel dibuat dengan textContent agar nama barang aman dari injeksi HTML
    const kolom = [
      { teks: index + 1, kelas: "" },
      { teks: item.nama, kelas: "" },
      { teks: formatRupiah(item.harga), kelas: "num" },
      { teks: item.qty, kelas: "num" },
      { teks: formatRupiah(hitungSubtotal(item)), kelas: "num" }
    ];
    kolom.forEach(function (k) {
      const td = document.createElement("td");
      td.textContent = k.teks;
      if (k.kelas) td.className = k.kelas;
      tr.appendChild(td);
    });

    const tdAksi = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-hapus";
    btn.textContent = "Hapus";
    btn.addEventListener("click", function () { hapusBarang(index); });
    tdAksi.appendChild(btn);
    tr.appendChild(tdAksi);

    tabelBody.appendChild(tr);
  });

  jumlahItem.textContent = keranjang.length + " item";
  tampilkanRingkasan();
}

/** Perbarui total, diskon, total akhir, dan kembalian */
function tampilkanRingkasan() {
  const total = hitungTotalBelanja();
  const diskon = hitungDiskon(total);
  const totalAkhir = total - diskon;

  teksTotal.textContent = formatRupiah(total);
  teksDiskon.textContent = "- " + formatRupiah(diskon);
  teksTotalAkhir.textContent = formatRupiah(totalAkhir);

  // Keterangan sumber diskon
  if (diskon > 0) {
    labelDiskon.textContent = promoAktif && total < BATAS_DISKON ? "(promo)" : "(10%)";
    infoDiskon.textContent = "Diskon 10% sudah diterapkan.";
  } else {
    labelDiskon.textContent = "";
    const kurang = BATAS_DISKON - total;
    infoDiskon.textContent = total > 0
      ? "Tambah belanja " + formatRupiah(kurang) + " lagi untuk diskon 10%."
      : "Belanja minimal " + formatRupiah(BATAS_DISKON) + " otomatis diskon 10%.";
  }

  tampilkanKembalian(totalAkhir);
}

/* ==========================================================
   8. EVENT LISTENER
   ========================================================== */

// Submit form: validasi dulu, baru tambah ke keranjang
formBarang.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validasiForm()) return;   // gagal validasi: barang tidak masuk keranjang
  tambahBarang();
  formBarang.reset();            // berhasil: form di-reset otomatis
  inputNama.focus();
});

// Hapus pesan error segera setelah pengguna memperbaiki input
inputNama.addEventListener("input",  function () { bersihkanError(inputNama,  errorNama); });
inputHarga.addEventListener("input", function () { bersihkanError(inputHarga, errorHarga); });
inputQty.addEventListener("input",   function () { bersihkanError(inputQty,   errorQty); });

btnPromo.addEventListener("click", terapkanPromo);
inputPromo.addEventListener("keydown", function (e) {
  if (e.key === "Enter") { e.preventDefault(); terapkanPromo(); }
});

// Kembalian dihitung otomatis setiap kali uang bayar diketik
inputBayar.addEventListener("input", tampilkanRingkasan);

btnReset.addEventListener("click", resetTransaksi);

/* ==========================================================
   9. INISIALISASI
   ========================================================== */
muatKeranjang();
tampilkanKeranjang();

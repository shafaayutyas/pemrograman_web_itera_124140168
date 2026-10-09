/* ==========================================================
   Latihan Web - script.js
   Bagian:
   0. Utilitas & navigasi tab
   1. Dark mode toggle (manipulasi class CSS)
   2. Data mahasiswa (validasi form + localStorage)
   3. Daftar post dari API (search + pagination)
   4. Todo list (DOM manipulation + localStorage)
   ========================================================== */

/* ==========================================================
   0. UTILITAS & NAVIGASI TAB
   ========================================================== */

/** Baca array dari localStorage dengan aman (JSON.parse) */
function bacaStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Gagal membaca localStorage:", key, err);
    return [];
  }
}

/** Simpan data ke localStorage (JSON.stringify) */
function tulisStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Gagal menyimpan localStorage:", key, err);
  }
}

/** Buat elemen dengan teks (textContent agar aman dari injeksi HTML) */
function buatElemen(tag, teks, kelas) {
  const el = document.createElement(tag);
  if (teks !== undefined) el.textContent = teks;
  if (kelas) el.className = kelas;
  return el;
}

function tampilkanError(input, elemenError, pesan) {
  input.classList.add("invalid");
  elemenError.textContent = pesan;
}
function bersihkanError(input, elemenError) {
  input.classList.remove("invalid");
  elemenError.textContent = "";
}

// Pindah tab
const semuaTab = document.querySelectorAll(".tab");
const semuaPanel = document.querySelectorAll(".tab-panel");

semuaTab.forEach(function (tab) {
  tab.addEventListener("click", function () {
    semuaTab.forEach(function (t) {
      const aktif = t === tab;
      t.classList.toggle("active", aktif);
      t.setAttribute("aria-selected", aktif);
    });
    semuaPanel.forEach(function (panel) {
      panel.hidden = panel.id !== tab.dataset.target;
    });
  });
});

/* ==========================================================
   1. DARK MODE TOGGLE
   Cukup menambah/menghapus class "dark" pada <body>.
   Warna berubah karena CSS variable di body.dark menimpa :root.
   ========================================================== */
const TEMA_KEY = "latihanTema";
const btnTema = document.getElementById("btn-tema");

function terapkanTema(gelap) {
  document.body.classList.toggle("dark", gelap);
  btnTema.textContent = gelap ? "Mode terang" : "Mode gelap";
  btnTema.setAttribute("aria-pressed", gelap);
}

btnTema.addEventListener("click", function () {
  const gelap = !document.body.classList.contains("dark");
  terapkanTema(gelap);
  localStorage.setItem(TEMA_KEY, gelap ? "dark" : "light"); // ingat pilihan
});

// Muat tema tersimpan; jika belum ada, ikuti preferensi sistem
const temaTersimpan = localStorage.getItem(TEMA_KEY);
terapkanTema(
  temaTersimpan
    ? temaTersimpan === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches
);

/* ==========================================================
   2. DATA MAHASISWA (validasi form + localStorage)
   ========================================================== */
const MHS_KEY = "latihanMahasiswa";
let daftarMahasiswa = bacaStorage(MHS_KEY);

const formMhs   = document.getElementById("form-mahasiswa");
const mhsNama   = document.getElementById("mhs-nama");
const mhsNim    = document.getElementById("mhs-nim");
const mhsEmail  = document.getElementById("mhs-email");
const mhsJurusan = document.getElementById("mhs-jurusan");
const mhsIpk    = document.getElementById("mhs-ipk");
const errMhs = {
  nama: document.getElementById("err-mhs-nama"),
  nim: document.getElementById("err-mhs-nim"),
  email: document.getElementById("err-mhs-email"),
  jurusan: document.getElementById("err-mhs-jurusan"),
  ipk: document.getElementById("err-mhs-ipk")
};
const tabelMhs = document.getElementById("tabel-mahasiswa");
const jumlahMhs = document.getElementById("jumlah-mahasiswa");

/** Setiap fungsi validasi mengembalikan pesan error, atau "" jika valid */
function validasiNamaMhs(nilai) {
  const nama = nilai.trim();
  if (nama === "") return "Nama wajib diisi.";
  if (nama.length < 3) return "Nama minimal 3 karakter.";
  if (!/^[A-Za-z\s.'-]+$/.test(nama)) return "Nama hanya boleh berisi huruf.";
  return "";
}

function validasiNim(nilai) {
  const nim = nilai.trim();
  if (nim === "") return "NIM wajib diisi.";
  if (!/^\d+$/.test(nim)) return "NIM hanya boleh berisi angka.";
  if (nim.length < 8 || nim.length > 12) return "NIM harus 8 sampai 12 digit.";
  if (daftarMahasiswa.some(function (m) { return m.nim === nim; })) {
    return "NIM sudah terdaftar.";
  }
  return "";
}

function validasiEmail(nilai) {
  const email = nilai.trim();
  if (email === "") return "Email wajib diisi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
  return "";
}

function validasiJurusan(nilai) {
  return nilai === "" ? "Program studi wajib dipilih." : "";
}

function validasiIpk(nilai) {
  if (nilai.trim() === "") return "IPK wajib diisi.";
  const ipk = Number(nilai);
  if (Number.isNaN(ipk)) return "IPK harus berupa angka.";
  if (ipk < 0 || ipk > 4) return "IPK harus antara 0 dan 4.";
  return "";
}

/** Validasi seluruh form mahasiswa; true jika semua valid */
function validasiFormMhs() {
  const hasil = [
    [mhsNama,    errMhs.nama,    validasiNamaMhs(mhsNama.value)],
    [mhsNim,     errMhs.nim,     validasiNim(mhsNim.value)],
    [mhsEmail,   errMhs.email,   validasiEmail(mhsEmail.value)],
    [mhsJurusan, errMhs.jurusan, validasiJurusan(mhsJurusan.value)],
    [mhsIpk,     errMhs.ipk,     validasiIpk(mhsIpk.value)]
  ];
  let valid = true;
  hasil.forEach(function (item) {
    const input = item[0], elemenError = item[1], pesan = item[2];
    if (pesan) { tampilkanError(input, elemenError, pesan); valid = false; }
    else bersihkanError(input, elemenError);
  });
  return valid;
}

function tampilkanMahasiswa() {
  tabelMhs.innerHTML = "";

  if (daftarMahasiswa.length === 0) {
    const tr = buatElemen("tr", undefined, "empty-row");
    const td = buatElemen("td", "Belum ada data mahasiswa.");
    td.colSpan = 7;
    tr.appendChild(td);
    tabelMhs.appendChild(tr);
  }

  daftarMahasiswa.forEach(function (m, index) {
    const tr = document.createElement("tr");
    tr.appendChild(buatElemen("td", index + 1));
    tr.appendChild(buatElemen("td", m.nama));
    tr.appendChild(buatElemen("td", m.nim));
    tr.appendChild(buatElemen("td", m.email));
    tr.appendChild(buatElemen("td", m.jurusan));
    tr.appendChild(buatElemen("td", m.ipk.toFixed(2), "num"));

    const tdAksi = document.createElement("td");
    const btn = buatElemen("button", "Hapus", "btn btn-hapus");
    btn.type = "button";
    btn.addEventListener("click", function () {
      daftarMahasiswa.splice(index, 1);
      tulisStorage(MHS_KEY, daftarMahasiswa);
      tampilkanMahasiswa();
    });
    tdAksi.appendChild(btn);
    tr.appendChild(tdAksi);

    tabelMhs.appendChild(tr);
  });

  jumlahMhs.textContent = daftarMahasiswa.length + " data";
}

formMhs.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validasiFormMhs()) return;

  daftarMahasiswa.push({
    nama: mhsNama.value.trim(),
    nim: mhsNim.value.trim(),
    email: mhsEmail.value.trim(),
    jurusan: mhsJurusan.value,
    ipk: Number(mhsIpk.value)
  });
  tulisStorage(MHS_KEY, daftarMahasiswa);
  tampilkanMahasiswa();
  formMhs.reset();
  mhsNama.focus();
});

// Hapus pesan error saat pengguna memperbaiki input
[[mhsNama, errMhs.nama], [mhsNim, errMhs.nim], [mhsEmail, errMhs.email],
 [mhsJurusan, errMhs.jurusan], [mhsIpk, errMhs.ipk]].forEach(function (p) {
  p[0].addEventListener("input", function () { bersihkanError(p[0], p[1]); });
});

tampilkanMahasiswa();

/* ==========================================================
   3. DAFTAR POST DARI API (search + pagination)
   Data diambil sekali dari JSONPlaceholder, lalu difilter
   dan dipotong per halaman di sisi klien.
   ========================================================== */
const API_POSTS = "https://jsonplaceholder.typicode.com/posts";
const POST_PER_HALAMAN = 10;

let semuaPost = [];      // seluruh data dari API
let hasilFilter = [];    // data setelah difilter berdasarkan title
let halamanSekarang = 1;

const cariPost   = document.getElementById("cari-post");
const daftarPost = document.getElementById("daftar-post");
const statusPost = document.getElementById("status-post");
const infoHasilPost = document.getElementById("info-hasil-post");
const infoHalaman = document.getElementById("info-halaman");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

/** Ambil data post dari API */
async function ambilPost() {
  statusPost.hidden = false;
  statusPost.className = "status-box";
  statusPost.textContent = "Memuat data dari API...";
  try {
    const response = await fetch(API_POSTS);
    if (!response.ok) throw new Error("Status " + response.status);
    semuaPost = await response.json();
    statusPost.hidden = true;
    terapkanFilter();
  } catch (err) {
    console.error("Gagal mengambil data API:", err);
    statusPost.className = "status-box error";
    statusPost.textContent = "Gagal memuat data. Periksa koneksi internet lalu muat ulang halaman.";
    infoHasilPost.textContent = "Gagal";
    infoHalaman.textContent = "";
    btnPrev.disabled = true;
    btnNext.disabled = true;
  }
}

/** Filter post berdasarkan title (tidak peka huruf besar/kecil) */
function terapkanFilter() {
  const kata = cariPost.value.trim().toLowerCase();
  hasilFilter = semuaPost.filter(function (p) {
    return p.title.toLowerCase().includes(kata);
  });
  halamanSekarang = 1; // kembali ke halaman 1 setiap kata kunci berubah
  tampilkanPost();
}

/** Tulis teks ke elemen; bagian yang cocok dengan kata kunci diberi <mark> */
function isiDenganHighlight(elemen, teks, kata) {
  elemen.textContent = "";
  const idx = kata ? teks.toLowerCase().indexOf(kata) : -1;
  if (idx === -1) {
    elemen.textContent = teks;
    return;
  }
  elemen.appendChild(document.createTextNode(teks.slice(0, idx)));
  elemen.appendChild(buatElemen("mark", teks.slice(idx, idx + kata.length)));
  elemen.appendChild(document.createTextNode(teks.slice(idx + kata.length)));
}

/** Render post untuk halaman yang sedang aktif */
function tampilkanPost() {
  const kata = cariPost.value.trim().toLowerCase();
  const totalHalaman = Math.max(1, Math.ceil(hasilFilter.length / POST_PER_HALAMAN));
  const awal = (halamanSekarang - 1) * POST_PER_HALAMAN;
  const potongan = hasilFilter.slice(awal, awal + POST_PER_HALAMAN);

  daftarPost.innerHTML = "";

  if (hasilFilter.length === 0) {
    statusPost.hidden = false;
    statusPost.className = "status-box";
    statusPost.textContent = "Tidak ada post dengan title tersebut.";
  } else {
    statusPost.hidden = true;
  }

  potongan.forEach(function (post) {
    const li = document.createElement("li");
    const h3 = document.createElement("h3");
    h3.appendChild(buatElemen("span", "#" + post.id, "post-id"));
    const judul = document.createElement("span");
    isiDenganHighlight(judul, post.title, kata);
    h3.appendChild(judul);
    li.appendChild(h3);
    li.appendChild(buatElemen("p", post.body));
    daftarPost.appendChild(li);
  });

  infoHasilPost.textContent = hasilFilter.length + " post";
  infoHalaman.textContent = "Halaman " + halamanSekarang + " dari " + totalHalaman;
  btnPrev.disabled = halamanSekarang <= 1;
  btnNext.disabled = halamanSekarang >= totalHalaman;
}

cariPost.addEventListener("input", terapkanFilter);

btnPrev.addEventListener("click", function () {
  if (halamanSekarang > 1) { halamanSekarang--; tampilkanPost(); }
});
btnNext.addEventListener("click", function () {
  const totalHalaman = Math.ceil(hasilFilter.length / POST_PER_HALAMAN);
  if (halamanSekarang < totalHalaman) { halamanSekarang++; tampilkanPost(); }
});

btnPrev.disabled = true;
btnNext.disabled = true;
ambilPost();

/* ==========================================================
   4. TODO LIST (tambah, hapus, tandai selesai + localStorage)
   Setiap todo: { id, teks, selesai }
   ========================================================== */
const TODO_KEY = "latihanTodo";
let daftarTodo = bacaStorage(TODO_KEY);

const formTodo  = document.getElementById("form-todo");
const inputTodo = document.getElementById("input-todo");
const errTodo   = document.getElementById("err-todo");
const ulTodo    = document.getElementById("daftar-todo");
const infoTodo  = document.getElementById("info-todo");
const btnHapusSelesai = document.getElementById("btn-hapus-selesai");

function simpanTodo() { tulisStorage(TODO_KEY, daftarTodo); }

function tambahTodo(teks) {
  daftarTodo.push({ id: Date.now(), teks: teks, selesai: false });
  simpanTodo();
  tampilkanTodo();
}

function hapusTodo(id) {
  daftarTodo = daftarTodo.filter(function (t) { return t.id !== id; });
  simpanTodo();
  tampilkanTodo();
}

function tandaiSelesai(id) {
  const todo = daftarTodo.find(function (t) { return t.id === id; });
  if (todo) {
    todo.selesai = !todo.selesai;
    simpanTodo();
    tampilkanTodo();
  }
}

function tampilkanTodo() {
  ulTodo.innerHTML = "";

  if (daftarTodo.length === 0) {
    ulTodo.appendChild(buatElemen("li", "Belum ada tugas. Tambahkan satu di atas.", "todo-empty"));
  }

  daftarTodo.forEach(function (todo) {
    const li = document.createElement("li");
    if (todo.selesai) li.classList.add("selesai");

    const cek = document.createElement("input");
    cek.type = "checkbox";
    cek.checked = todo.selesai;
    cek.setAttribute("aria-label", "Tandai selesai: " + todo.teks);
    cek.addEventListener("change", function () { tandaiSelesai(todo.id); });

    const btn = buatElemen("button", "Hapus", "btn btn-hapus");
    btn.type = "button";
    btn.addEventListener("click", function () { hapusTodo(todo.id); });

    li.appendChild(cek);
    li.appendChild(buatElemen("span", todo.teks, "todo-text"));
    li.appendChild(btn);
    ulTodo.appendChild(li);
  });

  const selesai = daftarTodo.filter(function (t) { return t.selesai; }).length;
  infoTodo.textContent = selesai + " dari " + daftarTodo.length + " tugas selesai";
  btnHapusSelesai.disabled = selesai === 0;
}

formTodo.addEventListener("submit", function (e) {
  e.preventDefault();
  const teks = inputTodo.value.trim();
  if (teks === "") {
    tampilkanError(inputTodo, errTodo, "Tugas tidak boleh kosong.");
    return;
  }
  bersihkanError(inputTodo, errTodo);
  tambahTodo(teks);
  formTodo.reset();
  inputTodo.focus();
});

inputTodo.addEventListener("input", function () { bersihkanError(inputTodo, errTodo); });

btnHapusSelesai.addEventListener("click", function () {
  daftarTodo = daftarTodo.filter(function (t) { return !t.selesai; });
  simpanTodo();
  tampilkanTodo();
});

tampilkanTodo();

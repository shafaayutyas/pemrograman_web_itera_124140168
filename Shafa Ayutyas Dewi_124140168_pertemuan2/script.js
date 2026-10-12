"use strict";

/* ==========================================================
   Personal Dashboard Mahasiswa - script.js
   Struktur:
   1. Konstanta & data referensi
   2. Fungsi bantu (arrow function)
   3. class TaskItem & class ScheduleItem (model data)
   4. class DashboardApp (state, localStorage, fetch, render)
   5. Inisialisasi
   ========================================================== */

/* ==========================================================
   1. KONSTANTA & DATA REFERENSI
   ========================================================== */
const NAMA_PENGGUNA = "Shafa"; // ganti dengan namamu
const STORAGE_KEY = "personalDashboardMahasiswa";

const API = {
  cuaca: "https://api.open-meteo.com/v1/forecast?latitude=-5.36&longitude=105.31&current_weather=true",
  kutipan: "https://dummyjson.com/quotes/random",
  tugas: "https://jsonplaceholder.typicode.com/todos?_limit=5"
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HARI_KULIAH = HARI.slice(1); // Senin - Sabtu

const LABEL_PRIORITAS = { tinggi: "Prioritas tinggi", sedang: "Prioritas sedang", rendah: "Prioritas rendah" };

const KODE_CUACA = {
  0: "Cerah", 1: "Cerah berawan", 2: "Berawan sebagian", 3: "Mendung",
  45: "Berkabut", 48: "Berkabut tebal",
  51: "Gerimis ringan", 53: "Gerimis", 55: "Gerimis lebat",
  61: "Hujan ringan", 63: "Hujan sedang", 65: "Hujan lebat",
  80: "Hujan lokal ringan", 81: "Hujan lokal", 82: "Hujan lokal lebat",
  95: "Badai petir", 96: "Badai petir + es", 99: "Badai petir lebat"
};

// Dipakai sekali saat aplikasi pertama dibuka. Silakan diedit atau dihapus lewat dashboard.
const JADWAL_CONTOH = [
  { matkul: "Pemrograman Web", hari: "Senin",  mulai: "08:00", selesai: "09:40", ruang: "Ruang 201" },
  { matkul: "Basis Data",      hari: "Selasa", mulai: "10:00", selesai: "11:40", ruang: "Lab 3" },
  { matkul: "Struktur Data",   hari: "Rabu",   mulai: "13:00", selesai: "14:40", ruang: "Ruang 105" }
];

/* ==========================================================
   2. FUNGSI BANTU (ARROW FUNCTION)
   ========================================================== */
const $ = (id) => document.getElementById(id);

const pad = (angka) => String(angka).padStart(2, "0");

// Mencegah injeksi HTML karena data pengguna ditulis lewat template literal + innerHTML
const escapeHtml = (teks = "") =>
  String(teks).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Menunda eksekusi fungsi sampai pengguna berhenti mengetik
const debounce = (fn, ms = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Fetch + cek status HTTP, mengembalikan JSON
const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

const parseTanggal = (iso) => {
  const [tahun, bulan, hari] = iso.split("-").map(Number);
  return new Date(tahun, bulan - 1, hari);
};

// Selisih hari antara tenggat dan hari ini (negatif = sudah lewat)
const selisihHari = (iso) => {
  const sekarang = new Date();
  const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  return Math.round((parseTanggal(iso) - hariIni) / 86400000);
};

const labelTenggat = (sisa) => {
  if (sisa < 0) return `Terlambat ${Math.abs(sisa)} hari`;
  if (sisa === 0) return "Hari ini";
  if (sisa === 1) return "Besok";
  return `${sisa} hari lagi`;
};

const salamWaktu = (jam) =>
  jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam";

const kapitalAwal = (teks) => teks.charAt(0).toUpperCase() + teks.slice(1);

// Urutan tugas: belum selesai dulu, lalu tenggat terdekat, tanpa tenggat di akhir
const urutkanTugas = (a, b) => {
  if (a.selesai !== b.selesai) return a.selesai - b.selesai;
  if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
  if (a.deadline) return -1;
  if (b.deadline) return 1;
  return 0;
};

/* ==========================================================
   3. MODEL DATA (CLASS)
   ========================================================== */

/** Model satu tugas. Objek dianggap immutable: perubahan lewat dengan() */
class TaskItem {
  constructor({ id = TaskItem.buatId(), judul, matkul = "", deadline = "", prioritas = "sedang", selesai = false }) {
    this.id = id;
    this.judul = judul;
    this.matkul = matkul;
    this.deadline = deadline;
    this.prioritas = prioritas;
    this.selesai = selesai;
  }

  static buatId() {
    return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  get sisaHari() {
    return this.deadline ? selisihHari(this.deadline) : null;
  }

  get terlambat() {
    return !this.selesai && this.sisaHari !== null && this.sisaHari < 0;
  }

  // Salinan baru dengan perubahan (spread operator), objek lama tidak diubah
  dengan(perubahan) {
    return new TaskItem({ ...this, ...perubahan });
  }

  toggleSelesai() {
    return this.dengan({ selesai: !this.selesai });
  }
}

/** Model satu sesi kuliah */
class ScheduleItem {
  constructor({ id = ScheduleItem.buatId(), matkul, hari, mulai, selesai, ruang = "" }) {
    this.id = id;
    this.matkul = matkul;
    this.hari = hari;
    this.mulai = mulai;
    this.selesai = selesai;
    this.ruang = ruang;
  }

  static buatId() {
    return `j${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  dengan(perubahan) {
    return new ScheduleItem({ ...this, ...perubahan });
  }
}

/* ==========================================================
   4. DASHBOARD APP
   Mengelola state, localStorage, fetch API, event, dan render.
   ========================================================== */
class DashboardApp {
  constructor() {
    this.state = {
      tasks: [],
      schedule: [],
      note: "",
      filter: "semua",
      editingTaskId: null,
      editingScheduleId: null
    };
    this.hariTerakhir = HARI[new Date().getDay()];
    this.ui = {
      tanggal: $("tanggal"), salam: $("salam"), nama: $("nama-pengguna"), jam: $("jam"),
      cuaca: $("cuaca"), kutipan: $("kutipan"),
      statAktif: $("stat-aktif"), statTerlambat: $("stat-terlambat"), statKuliah: $("stat-kuliah"),
      progresTeks: $("progres-teks"), progresBar: $("progres-bar"),
      formTugas: $("form-tugas"), btnSimpanTugas: $("btn-simpan-tugas"), btnBatalTugas: $("btn-batal-tugas"),
      daftarTugas: $("daftar-tugas"),
      formJadwal: $("form-jadwal"), btnSimpanJadwal: $("btn-simpan-jadwal"), btnBatalJadwal: $("btn-batal-jadwal"),
      selectHari: $("jadwal-hari"), daftarJadwal: $("daftar-jadwal"),
      catatan: $("catatan"), statusCatatan: $("status-catatan"),
      filters: document.querySelectorAll("[data-filter]")
    };
  }

  /* ---------- Inisialisasi ---------- */
  async init() {
    const sudahAda = this.muatDariStorage();

    this.ui.nama.textContent = NAMA_PENGGUNA;
    this.ui.selectHari.innerHTML = HARI_KULIAH.map((h) => `<option value="${h}">${h}</option>`).join("");
    this.ui.catatan.value = this.state.note;

    this.bindEvents();
    this.mulaiJam();

    if (!sudahAda) this.isiJadwalContoh();
    this.renderAll();

    // Tiga operasi asinkron berjalan bersamaan; satu gagal tidak menghentikan yang lain
    const pekerjaan = [this.muatCuaca(), this.muatKutipan()];
    if (!sudahAda) pekerjaan.push(this.isiTugasAwal());
    await Promise.allSettled(pekerjaan);
  }

  /* ---------- localStorage ---------- */
  muatDariStorage() {
    try {
      const mentah = localStorage.getItem(STORAGE_KEY);
      if (!mentah) return false;
      const { tasks = [], schedule = [], note = "" } = JSON.parse(mentah);
      this.state = {
        ...this.state,
        tasks: tasks.map((t) => new TaskItem(t)),
        schedule: schedule.map((s) => new ScheduleItem(s)),
        note
      };
      return true;
    } catch (err) {
      console.error("Data localStorage tidak dapat dibaca:", err);
      return false;
    }
  }

  simpanKeStorage() {
    const { tasks, schedule, note } = this.state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, schedule, note }));
    } catch (err) {
      console.error("Data tidak dapat disimpan:", err);
    }
  }

  /** Perbarui state secara immutable, simpan, lalu render ulang */
  update(perubahan, { simpan = true, render = true } = {}) {
    this.state = { ...this.state, ...perubahan };
    if (simpan) this.simpanKeStorage();
    if (render) this.renderAll();
  }

  isiJadwalContoh() {
    this.state = { ...this.state, schedule: JADWAL_CONTOH.map((j) => new ScheduleItem(j)) };
    this.simpanKeStorage();
  }

  /* ---------- Data dari API (async/await) ---------- */
  async isiTugasAwal() {
    try {
      const todos = await fetchJson(API.tugas);
      const tugasAwal = todos.map(({ title, completed }) => new TaskItem({
        judul: kapitalAwal(title),
        matkul: "Contoh dari API",
        prioritas: "rendah",
        selesai: completed
      }));
      this.update({ tasks: [...this.state.tasks, ...tugasAwal] });
    } catch (err) {
      console.error("Gagal mengambil tugas awal:", err);
      this.update({
        tasks: [...this.state.tasks, new TaskItem({ judul: "Coba tambahkan tugas pertamamu", prioritas: "rendah" })]
      });
    }
  }

  async muatCuaca() {
    try {
      const { current_weather: cuaca } = await fetchJson(API.cuaca);
      const kondisi = KODE_CUACA[cuaca.weathercode] ?? "Kondisi tidak diketahui";
      this.ui.cuaca.innerHTML = `
        <p class="temp">${Math.round(cuaca.temperature)}&deg;C</p>
        <p class="weather-desc">${kondisi}</p>
        <p class="weather-meta">Angin ${cuaca.windspeed} km/jam &middot; ITERA, Lampung Selatan</p>`;
    } catch (err) {
      console.error("Gagal memuat cuaca:", err);
      this.ui.cuaca.innerHTML = `<p class="muted">Cuaca tidak tersedia. Periksa koneksi internet.</p>`;
    }
  }

  async muatKutipan() {
    try {
      const { quote, author } = await fetchJson(API.kutipan);
      this.ui.kutipan.innerHTML = `
        <p class="quote-text">&ldquo;${escapeHtml(quote)}&rdquo;</p>
        <p class="quote-author">&mdash; ${escapeHtml(author)}</p>`;
    } catch (err) {
      console.error("Gagal memuat kutipan:", err);
      this.ui.kutipan.innerHTML = `<p class="muted">Kutipan tidak tersedia.</p>`;
    }
  }

  /* ---------- Jam & tanggal ---------- */
  mulaiJam() {
    const tick = () => {
      const sekarang = new Date();
      this.ui.jam.textContent = `${pad(sekarang.getHours())}.${pad(sekarang.getMinutes())}.${pad(sekarang.getSeconds())}`;
      this.ui.tanggal.textContent = sekarang.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      this.ui.salam.textContent = salamWaktu(sekarang.getHours());

      // Ganti hari: sorotan jadwal & ringkasan perlu diperbarui
      const hariIni = HARI[sekarang.getDay()];
      if (hariIni !== this.hariTerakhir) {
        this.hariTerakhir = hariIni;
        this.renderAll();
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Event ---------- */
  bindEvents() {
    const { formTugas, formJadwal, daftarTugas, daftarJadwal, filters, catatan } = this.ui;

    formTugas.addEventListener("submit", (e) => this.kirimFormTugas(e));
    formJadwal.addEventListener("submit", (e) => this.kirimFormJadwal(e));
    this.ui.btnBatalTugas.addEventListener("click", () => this.batalEditTugas());
    this.ui.btnBatalJadwal.addEventListener("click", () => this.batalEditJadwal());

    // Event delegation: satu listener untuk semua tombol di dalam daftar
    daftarTugas.addEventListener("click", (e) => {
      const tombol = e.target.closest("[data-action]");
      if (!tombol) return;
      const { action, id } = tombol.dataset;
      if (action === "toggle") this.toggleTugas(id);
      if (action === "edit") this.mulaiEditTugas(id);
      if (action === "delete") this.hapusTugas(id);
    });

    daftarJadwal.addEventListener("click", (e) => {
      const tombol = e.target.closest("[data-action]");
      if (!tombol) return;
      const { action, id } = tombol.dataset;
      if (action === "edit") this.mulaiEditJadwal(id);
      if (action === "delete") this.hapusJadwal(id);
    });

    filters.forEach((tombol) => {
      tombol.addEventListener("click", () => this.update({ filter: tombol.dataset.filter }, { simpan: false }));
    });

    // Hapus pesan error saat pengguna mulai memperbaiki isian
    [formTugas, formJadwal].forEach((form) => {
      form.addEventListener("input", ({ target }) => {
        target.classList.remove("invalid");
        const pesan = form.querySelector(`[data-error="${target.name}"]`);
        if (pesan) pesan.textContent = "";
      });
    });

    // Catatan tersimpan otomatis setelah berhenti mengetik
    const simpanCatatan = debounce((nilai) => {
      this.update({ note: nilai }, { render: false });
      this.ui.statusCatatan.textContent = "Tersimpan otomatis";
    });
    catatan.addEventListener("input", ({ target }) => {
      this.ui.statusCatatan.textContent = "Menyimpan...";
      simpanCatatan(target.value);
    });
  }

  /* ---------- Validasi ---------- */
  static validasiTugas({ judul = "" }) {
    const errors = {};
    if (judul.trim() === "") errors.judul = "Judul tugas wajib diisi.";
    else if (judul.trim().length < 3) errors.judul = "Judul minimal 3 karakter.";
    return errors;
  }

  static validasiJadwal({ matkul = "", mulai = "", selesai = "" }) {
    const errors = {};
    if (matkul.trim().length < 3) errors.matkul = "Nama mata kuliah minimal 3 karakter.";
    if (!mulai) errors.mulai = "Jam mulai wajib diisi.";
    if (!selesai) errors.selesai = "Jam selesai wajib diisi.";
    else if (mulai && selesai <= mulai) errors.selesai = "Jam selesai harus setelah jam mulai.";
    return errors;
  }

  tampilkanError(form, errors) {
    form.querySelectorAll("[data-error]").forEach((p) => {
      p.textContent = errors[p.dataset.error] ?? "";
    });
    form.querySelectorAll("input, select").forEach((input) => {
      input.classList.toggle("invalid", Boolean(errors[input.name]));
    });
    const pertama = form.querySelector(".invalid");
    pertama?.focus();
  }

  /* ---------- CRUD tugas ---------- */
  kirimFormTugas(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const errors = DashboardApp.validasiTugas(data);
    this.tampilkanError(form, errors);
    if (Object.keys(errors).length > 0) return;

    const { judul, matkul, deadline, prioritas } = data;
    const isian = { judul: judul.trim(), matkul: matkul.trim(), deadline, prioritas };
    const { tasks, editingTaskId } = this.state;

    const tasksBaru = editingTaskId
      ? tasks.map((t) => (t.id === editingTaskId ? t.dengan(isian) : t)) // edit
      : [...tasks, new TaskItem(isian)];                                  // tambah

    form.reset();
    this.update({ tasks: tasksBaru, editingTaskId: null });
  }

  mulaiEditTugas(id) {
    const tugas = this.state.tasks.find((t) => t.id === id);
    if (!tugas) return;
    const { formTugas } = this.ui;
    formTugas.elements.judul.value = tugas.judul;
    formTugas.elements.matkul.value = tugas.matkul;
    formTugas.elements.deadline.value = tugas.deadline;
    formTugas.elements.prioritas.value = tugas.prioritas;
    this.tampilkanError(formTugas, {});
    this.update({ editingTaskId: id }, { simpan: false });
    formTugas.elements.judul.focus();
  }

  batalEditTugas() {
    this.ui.formTugas.reset();
    this.tampilkanError(this.ui.formTugas, {});
    this.update({ editingTaskId: null }, { simpan: false });
  }

  toggleTugas(id) {
    this.update({ tasks: this.state.tasks.map((t) => (t.id === id ? t.toggleSelesai() : t)) });
  }

  hapusTugas(id) {
    const tugas = this.state.tasks.find((t) => t.id === id);
    if (!tugas || !confirm(`Hapus tugas "${tugas.judul}"?`)) return;
    if (this.state.editingTaskId === id) this.ui.formTugas.reset();
    this.update({
      tasks: this.state.tasks.filter((t) => t.id !== id),
      editingTaskId: this.state.editingTaskId === id ? null : this.state.editingTaskId
    });
  }

  /* ---------- CRUD jadwal ---------- */
  kirimFormJadwal(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const errors = DashboardApp.validasiJadwal(data);
    this.tampilkanError(form, errors);
    if (Object.keys(errors).length > 0) return;

    const { matkul, hari, mulai, selesai, ruang } = data;
    const isian = { matkul: matkul.trim(), hari, mulai, selesai, ruang: ruang.trim() };
    const { schedule, editingScheduleId } = this.state;

    const jadwalBaru = editingScheduleId
      ? schedule.map((j) => (j.id === editingScheduleId ? j.dengan(isian) : j))
      : [...schedule, new ScheduleItem(isian)];

    form.reset();
    this.update({ schedule: jadwalBaru, editingScheduleId: null });
  }

  mulaiEditJadwal(id) {
    const jadwal = this.state.schedule.find((j) => j.id === id);
    if (!jadwal) return;
    const { formJadwal } = this.ui;
    const { matkul, hari, mulai, selesai, ruang } = jadwal;
    formJadwal.elements.matkul.value = matkul;
    formJadwal.elements.hari.value = hari;
    formJadwal.elements.mulai.value = mulai;
    formJadwal.elements.selesai.value = selesai;
    formJadwal.elements.ruang.value = ruang;
    this.tampilkanError(formJadwal, {});
    this.update({ editingScheduleId: id }, { simpan: false });
    formJadwal.elements.matkul.focus();
  }

  batalEditJadwal() {
    this.ui.formJadwal.reset();
    this.tampilkanError(this.ui.formJadwal, {});
    this.update({ editingScheduleId: null }, { simpan: false });
  }

  hapusJadwal(id) {
    const jadwal = this.state.schedule.find((j) => j.id === id);
    if (!jadwal || !confirm(`Hapus jadwal "${jadwal.matkul}"?`)) return;
    if (this.state.editingScheduleId === id) this.ui.formJadwal.reset();
    this.update({
      schedule: this.state.schedule.filter((j) => j.id !== id),
      editingScheduleId: this.state.editingScheduleId === id ? null : this.state.editingScheduleId
    });
  }

  /* ---------- Render ---------- */
  renderAll() {
    this.renderStatistik();
    this.renderModeForm();
    this.renderTugas();
    this.renderJadwal();
  }

  renderModeForm() {
    const { editingTaskId, editingScheduleId, filter } = this.state;
    const { btnSimpanTugas, btnBatalTugas, btnSimpanJadwal, btnBatalJadwal, filters } = this.ui;
    btnSimpanTugas.textContent = editingTaskId ? "Simpan perubahan" : "Tambah tugas";
    btnBatalTugas.hidden = !editingTaskId;
    btnSimpanJadwal.textContent = editingScheduleId ? "Simpan perubahan" : "Tambah jadwal";
    btnBatalJadwal.hidden = !editingScheduleId;
    filters.forEach((f) => f.classList.toggle("active", f.dataset.filter === filter));
  }

  renderStatistik() {
    const { tasks, schedule } = this.state;
    const aktif = tasks.filter((t) => !t.selesai).length;
    const terlambat = tasks.filter((t) => t.terlambat).length;
    const hariIni = HARI[new Date().getDay()];
    const kuliahHariIni = schedule.filter((j) => j.hari === hariIni).length;
    const selesai = tasks.length - aktif;
    const persen = tasks.length ? Math.round((selesai / tasks.length) * 100) : 0;

    this.ui.statAktif.textContent = aktif;
    this.ui.statTerlambat.textContent = terlambat;
    this.ui.statKuliah.textContent = kuliahHariIni;
    this.ui.progresTeks.textContent = `${selesai} / ${tasks.length} selesai`;
    this.ui.progresBar.style.width = `${persen}%`;
  }

  renderTugas() {
    const { tasks, filter } = this.state;
    const tampil = tasks
      .filter((t) => filter === "semua" || (filter === "aktif" ? !t.selesai : t.selesai))
      .sort(urutkanTugas);

    if (tampil.length === 0) {
      const pesan = tasks.length === 0 ? "Belum ada tugas. Tambahkan tugas pertamamu di atas." : "Tidak ada tugas pada filter ini.";
      this.ui.daftarTugas.innerHTML = `<li class="empty">${pesan}</li>`;
      return;
    }

    this.ui.daftarTugas.innerHTML = tampil.map((t) => {
      const { id, judul, matkul, deadline, prioritas, selesai, sisaHari, terlambat } = t;
      const chipTenggat = deadline && sisaHari !== null
        ? `<span class="chip ${terlambat ? "chip-late" : sisaHari === 0 && !selesai ? "chip-today" : "chip-due"}">
             ${parseTanggal(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} &middot; ${labelTenggat(sisaHari)}
           </span>`
        : "";
      return `
        <li class="task prio-${prioritas} ${selesai ? "done" : ""}">
          <input type="checkbox" data-action="toggle" data-id="${id}" ${selesai ? "checked" : ""}
                 aria-label="Tandai selesai: ${escapeHtml(judul)}">
          <div class="task-body">
            <p class="task-title">${escapeHtml(judul)}</p>
            <p class="task-meta">
              ${matkul ? `<span class="chip">${escapeHtml(matkul)}</span>` : ""}
              ${chipTenggat}
              <span class="chip">${LABEL_PRIORITAS[prioritas]}</span>
            </p>
          </div>
          <div class="task-actions">
            <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${id}">Edit</button>
            <button type="button" class="btn btn-sm btn-del" data-action="delete" data-id="${id}">Hapus</button>
          </div>
        </li>`;
    }).join("");
  }

  renderJadwal() {
    const { schedule } = this.state;
    const hariIni = HARI[new Date().getDay()];

    if (schedule.length === 0) {
      this.ui.daftarJadwal.innerHTML = `<p class="empty">Belum ada jadwal kuliah.</p>`;
      return;
    }

    this.ui.daftarJadwal.innerHTML = HARI_KULIAH.map((hari) => {
      const sesi = schedule.filter((j) => j.hari === hari).sort((a, b) => a.mulai.localeCompare(b.mulai));
      if (sesi.length === 0) return "";
      const penanda = hari === hariIni ? `<span class="chip chip-today">Hari ini</span>` : "";
      const baris = sesi.map(({ id, matkul, mulai, selesai, ruang }) => `
        <li class="class-row">
          <div class="class-info">
            <p class="class-name">${escapeHtml(matkul)}</p>
            <p class="class-time">${mulai} - ${selesai}${ruang ? ` &middot; ${escapeHtml(ruang)}` : ""}</p>
          </div>
          <div class="class-actions">
            <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${id}">Edit</button>
            <button type="button" class="btn btn-sm btn-del" data-action="delete" data-id="${id}">Hapus</button>
          </div>
        </li>`).join("");
      return `<section class="day ${hari === hariIni ? "today" : ""}"><h3>${hari} ${penanda}</h3><ul>${baris}</ul></section>`;
    }).join("");
  }
}

/* ==========================================================
   5. INISIALISASI
   ========================================================== */
const app = new DashboardApp();
app.init();

# DompetKu — Pencatatan Keuangan Pribadi

## 1. Menyiapkan file
Pastikan lima file ini ada dalam satu folder: `index.html`, `style.css`, `db.js`, `app.js`, `service-worker.js`.

## 2. Upload ke GitHub
1. Buka github.com → **New repository** → beri nama (mis. `dompetku`) → **Public** → Create.
2. Klik **uploading an existing file**, tarik kelima file (bukan foldernya) → **Commit changes**.

## 3. Aktifkan GitHub Pages
Repository → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → **Save**. Tunggu 1–3 menit.

## 4. Buka di HP
Buka `https://USERNAME.github.io/dompetku/` di Chrome. Buka sekali saat **online** agar file (termasuk library Excel) tersimpan untuk mode offline. Opsional: menu ⋮ → *Tambahkan ke layar utama*.

## 5. Backup
Menu **Rekap** → bagian **Backup**: *Ekspor backup JSON* (cadangan lengkap), *Ekspor Excel* (riwayat transaksi), *Impor backup JSON* (pilih **Gabungkan** untuk menambah data baru saja, atau **Ganti semua** dengan konfirmasi). Transaksi dengan ID yang sama tidak diduplikasi; file tidak valid ditolak tanpa mengubah data.

## 6. Batasan
- Data tersimpan **di browser HP**, bukan di GitHub dan tidak tersinkron ke perangkat lain. Menghapus data situs/cache Chrome atau mode incognito dapat menghapus data. **Backup JSON rutin itu wajib.**
- Saldo akun = saldo awal akun (diisi saat pertama kali) + pemasukan − pengeluaran ± transfer. "Saldo awal periode" hanyalah catatan laporan dan tidak menambah saldo akun.
- Offline: aktif setelah halaman dibuka sekali saat online (lihat status di Rekap). Setelah mengubah file, ganti `dompetku-v1` menjadi `v2` di `service-worker.js`. Data tidak terhapus saat update.
- Ekspor Excel butuh library dari internet yang disimpan otomatis setelah dimuat pertama kali; jika belum, muncul pesan error dan fitur lain tetap jalan.

## Update v2 (akun, mata uang, statistik)
Upload ulang `app.js`, `style.css`, `service-worker.js`, `README.md` ke repository (replace file lama), commit, tunggu 1–2 menit. Di HP: tutup Chrome sepenuhnya lalu buka link dua kali agar versi baru aktif. Data lama tidak terhapus (IndexedDB tidak diubah/direset).
- Akun: menu Transfer → Tambah akun (layanan, nama, mata uang, saldo awal). Mata uang dan saldo awal tidak bisa diubah setelah akun dibuat; nama dan jenis bisa.
- Kurs manual: menu Rekap → bagian Total saldo (tampil jika ada akun non-IDR). Hanya estimasi, bukan kurs real-time.
- Transfer beda mata uang: isi nominal keluar, lalu nominal masuk atau kurs. Biaya admin dicatat sebagai pengeluaran terpisah (kategori Lainnya).
- Statistik Rekap dihitung per satu mata uang; pilih "Semua mata uang (estimasi IDR)" setelah kurs diisi.

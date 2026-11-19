# Leonida Trophy Ledger

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/motumona/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/motumona/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

Panduan + tracker offline 55 trophy PS5 GTA VI: nama dan deskripsi resmi
tiap trophy, grade, checklist tersimpan di browser, filter per jenis,
pengaturan spoiler yang menyembunyikan trophy cerita, roadmap ke platinum,
dan penanda trophy missable. Kompetisi:
<https://make.fun/bounty/gta6-trophy-guide-01>.

## Cara memakai

1. Jalankan server statis lokal:
   ```sh
   node serve.ts
   ```
2. Buka <http://localhost:8080> di desktop Chrome.
3. Centang trophy yang sudah didapat; pakai filter, export/import untuk
   cadangan, dan roadmap untuk melihat jalur ke platinum.

## Yang ada di dalam app

- `app/index.html` — struktur panduan dan tracker.
- `app/css/base.css` — tampilan panduan.
- `app/js/` — data, filter, roadmap, penyimpanan, tampilan.
- `app/data/trophies.json` — ke-55 trophy resmi (nama, deskripsi, grade).
- `screenshots/` — empat tangkapan layar panduan yang sedang berjalan.
- `main.ts` — entry program.

## Catatan originalitas

Nama dan deskripsi trophy adalah data resmi; panduan tiap trophy ditulis
dengan kata-kata sendiri dan sumbernya dikutip. Tidak ada logo, artwork,
atau aset resmi Rockstar di entri ini.

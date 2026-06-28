# Jobs / Queue Notes

Queue utama:
- `signal-engine` → generate signal berkala
- `notification-engine` → kirim push / in-app notifications

Rencana job production:
- sync quotes tiap 1 menit
- sync economic events tiap 5 menit
- generate signals tiap 1-2 menit
- evaluate TP/SL tiap 1 menit
- send notification saat signal baru / TP / SL / event reminder

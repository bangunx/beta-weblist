# 📹 Peta CCTV Kota Malang - Modular Version

Aplikasi web interaktif untuk menampilkan peta CCTV Kota Malang dengan arsitektur modular yang dapat berjalan tanpa server (pure HTML, CSS, JavaScript).

## 🚀 Fitur Utama

- **Peta Interaktif**: Menggunakan Leaflet.js dengan marker clustering
- **Pencarian Real-time**: Pencarian CCTV berdasarkan nama, lokasi, atau tipe
- **Filter Cerdas**: Filter berdasarkan status (online/offline) dan tipe (persimpangan/jalan)
- **Statistik Real-time**: Menampilkan statistik CCTV secara live
- **Detail Lengkap**: Popup dengan informasi detail CCTV dan link streaming
- **Keyboard Shortcuts**: Dukungan shortcut keyboard untuk navigasi cepat
- **Responsive Design**: Optimized untuk desktop dan mobile
- **Performance Optimized**: Caching dan optimasi untuk performa terbaik

## 📁 Struktur File

```
cctv-malang/
├── index-modular.html          # File HTML utama (versi modular)
├── index.html                  # File HTML original
├── styles.css                  # CSS terpisah dengan styling lengkap
├── js/
│   ├── data.js                 # Data CCTV embedded
│   ├── utils.js                # Utility functions
│   ├── performance.js          # Performance optimization
│   ├── keyboard.js             # Keyboard shortcuts
│   ├── data.js                 # Data management class
│   ├── map.js                  # Map management class
│   ├── ui.js                   # UI management class
│   └── app.js                  # Main application class
└── data/
    └── cctv_organized.json     # Data CCTV lengkap
```

## 🎯 Cara Penggunaan

### 1. Buka Aplikasi
Buka file `index-modular.html` di browser web modern.

### 2. Navigasi Peta
- **Zoom**: Scroll mouse atau gunakan tombol +/- di peta
- **Pan**: Drag mouse untuk memindahkan peta
- **Marker**: Klik marker untuk melihat detail CCTV

### 3. Pencarian
- Ketik di kotak pencarian untuk mencari CCTV
- Hasil pencarian akan muncul secara real-time
- Klik hasil untuk fokus ke CCTV tersebut

### 4. Filter
- **Semua**: Tampilkan semua CCTV
- **Online**: Hanya CCTV yang online
- **Offline**: Hanya CCTV yang offline
- **Persimpangan**: CCTV di persimpangan
- **Jalan**: CCTV di jalan

### 5. Keyboard Shortcuts
- `Ctrl + R`: Refresh data
- `Escape`: Reset filter
- `Ctrl + F`: Focus search
- `F11`: Toggle fullscreen
- `Ctrl + H`: Show help
- `+ / =`: Zoom in
- `-`: Zoom out
- `Ctrl + 0`: Fit to all markers
- `1-5`: Quick filters (1=all, 2=online, 3=offline, 4=intersection, 5=street)

## 🏗️ Arsitektur Modular

### DataManager (`js/data.js`)
- Mengelola data CCTV
- Filtering dan pencarian
- Statistik dan analisis
- Export data

### MapManager (`js/map.js`)
- Inisialisasi peta Leaflet
- Manajemen marker dan cluster
- Event handling peta
- Popup dan interaksi

### UIManager (`js/ui.js`)
- Manajemen antarmuka pengguna
- Modal dan dialog
- Notifikasi
- Update statistik

### PerformanceManager (`js/performance.js`)
- Optimasi performa
- Caching
- Memory management
- Lazy loading

### KeyboardManager (`js/keyboard.js`)
- Keyboard shortcuts
- Event handling keyboard
- Help system

### Utils (`js/utils.js`)
- Utility functions
- Helper functions
- Formatting
- Validation

## 🔧 Konfigurasi

### Mengganti Data CCTV
1. Edit file `js/data.js`
2. Ganti konstanta `cctvData` dengan data baru
3. Pastikan format data sesuai dengan struktur yang ada

### Mengubah Styling
1. Edit file `styles.css`
2. Sesuaikan warna, font, dan layout
3. CSS menggunakan CSS Grid dan Flexbox untuk layout responsif

### Menambah Fitur
1. Buat module baru di folder `js/`
2. Import module di `index-modular.html`
3. Inisialisasi di `app.js`

## 📱 Responsive Design

Aplikasi menggunakan CSS Grid dan Flexbox untuk layout responsif:
- **Desktop**: Layout penuh dengan semua panel terlihat
- **Tablet**: Layout menyesuaikan dengan ukuran layar
- **Mobile**: Layout compact dengan panel yang dapat disembunyikan

## ⚡ Performance

### Optimasi yang Diterapkan
- **Marker Clustering**: Mengelompokkan marker untuk performa lebih baik
- **Caching**: Cache marker dan popup untuk mengurangi pembuatan ulang
- **Lazy Loading**: Load data secara bertahap
- **Debouncing**: Mengurangi frekuensi event handling
- **Memory Management**: Cleanup otomatis untuk mencegah memory leak

### Monitoring Performance
- Gunakan browser DevTools untuk monitoring
- Performance metrics tersedia di `PerformanceManager`
- Memory usage dapat dimonitor melalui `performance.memory`

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 📋 Dependencies

### External Libraries
- **Leaflet.js**: 1.9.4 (Peta interaktif)
- **Leaflet.markercluster**: 1.5.3 (Marker clustering)

### CDN Links
```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
```

## 🚀 Deployment

### Static Hosting
Aplikasi dapat di-host di:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Firebase Hosting**
- **AWS S3 + CloudFront**

### Local Development
1. Clone repository
2. Buka `index-modular.html` di browser
3. Atau gunakan local server:
   ```bash
   python -m http.server 8000
   # atau
   npx serve .
   ```

## 🔒 Security

- Tidak ada server-side code
- Data CCTV embedded di client
- Tidak ada API calls external
- Pure client-side application

## 📊 Data Structure

### CCTV Object
```javascript
{
  "id": "unique-id",
  "name": "Nama CCTV",
  "status": 1, // 1 = online, 0 = offline
  "latitude": "-7.981779115765",
  "longitude": "112.63174579237",
  "street": "Alamat jalan",
  "district": "Kecamatan",
  "city": "Kota Malang",
  "camera_type": "Jalan", // atau "Persimpangan"
  "priority": "Normal", // atau "Tinggi", "Sedang"
  "webrtc_url": "http://...",
  "hls_url": "http://..."
}
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License - Lihat file LICENSE untuk detail.

## 📞 Support

Untuk pertanyaan atau masalah:
- Buat issue di GitHub
- Email: support@example.com
- Dokumentasi: [Wiki](https://github.com/username/cctv-malang/wiki)

---

**Dibuat dengan ❤️ untuk Kota Malang**

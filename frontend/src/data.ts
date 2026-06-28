export interface Signal {
  id: number;
  pair: string;
  icon: string;
  cat: string;
  type: "BUY" | "SELL";
  entry: string;
  tp: string[];
  sl: string;
  conf: number;
  change: string;
  up: boolean;
  time: string;
}

export const SIGNALS: Signal[] = [
  { id: 1, pair: "BTC/USDT", icon: "₿", cat: "Crypto", type: "BUY", entry: "67.432", tp: ["68.200", "69.500", "71.000"], sl: "66.800", conf: 97, change: "+4.82%", up: true, time: "2m lalu" },
  { id: 2, pair: "EUR/USD", icon: "€", cat: "Forex", type: "BUY", entry: "1.0842", tp: ["1.0870", "1.0895", "1.0920"], sl: "1.0815", conf: 94, change: "+0.42%", up: true, time: "8m lalu" },
  { id: 3, pair: "XAU/USD", icon: "Au", cat: "Emas", type: "SELL", entry: "2.042,5", tp: ["2.035", "2.028", "2.020"], sl: "2.050", conf: 89, change: "-0.18%", up: false, time: "14m lalu" },
  { id: 4, pair: "ETH/USDT", icon: "Ξ", cat: "Crypto", type: "BUY", entry: "3.482", tp: ["3.550", "3.620", "3.710"], sl: "3.420", conf: 92, change: "+6.20%", up: true, time: "22m lalu" },
  { id: 5, pair: "GBP/JPY", icon: "£", cat: "Forex", type: "SELL", entry: "192.84", tp: ["192.40", "191.95", "191.50"], sl: "193.30", conf: 86, change: "-0.38%", up: false, time: "31m lalu" },
  { id: 6, pair: "NAS100", icon: "N", cat: "Indeks", type: "BUY", entry: "18.245", tp: ["18.400", "18.580", "18.750"], sl: "18.120", conf: 91, change: "+1.82%", up: true, time: "44m lalu" },
];

export interface NewsItem {
  id: number;
  cat: string;
  title: string;
  excerpt: string;
  content: string;
  time: string;
  impact: string;
  sent: string;
  g: string;
  hot?: boolean;
  src: string;
  read: string;
}

export const NEWS: NewsItem[] = [
  { id: 1, cat: "Crypto", title: "Bitcoin Tembus $67K, Arus Dana Institusi Rekor Tertinggi", excerpt: "Manajer aset besar tingkatkan eksposur BTC 340% kuartal ini.", content: "Bitcoin telah menembus level psikologis $67.000 untuk pertama kalinya dalam sejarah, didorong oleh arus masuk institusional yang belum pernah terjadi sebelumnya. Data on-chain menunjukkan bahwa manajer aset besar telah meningkatkan eksposur mereka terhadap BTC sebesar 340% pada kuartal ini, dengan mayoritas berasal dari dana pensiun dan perusahaan asuransi.\n\nPara analis mencatat bahwa adopsi institusional ini menandai fase baru dalam siklus Bitcoin, di mana cryptocurrency semakin dianggap sebagai aset pelindung nilai yang sah. BlackRock, Fidelity, dan Grayscale terus menambah posisi mereka, sementara ETF spot Bitcoin melaporkan arus masuk bersih mingguan tertinggi sepanjang masa.\n\nDampaknya terhadap pasar sangat luas, dengan Ethereum dan altcoin utama juga mengalami kenaikan signifikan mengikuti momentum Bitcoin.", time: "2j lalu", impact: "TINGGI", sent: "BULLISH", g: "from-orange-500 to-violet-700", hot: true, src: "CoinDesk ID", read: "4 menit" },
  { id: 2, cat: "Forex", title: "The Fed Sinyalkan Potensi Pemangkasan Suku Bunga Q1 2026", excerpt: "Komentar Ketua Fed menunjukkan pelonggaran moneter di depan.", content: "Ketua Federal Reserve memberikan pernyataan dovish yang mengindikasikan kemungkinan pemangkasan suku bunga pada kuartal pertama 2026, mengirimkan USD lebih rendah terhadap pasangan mata uang utama.\n\nDalam konferensi pers setelah pertemuan FOMC, Ketua Fed menekankan bahwa inflasi telah bergerak secara berkelanjutan menuju target 2% dan bahwa bank sentral sekarang dapat mempertimbangkan pelonggaran kebijakan moneter tanpa mengkhawatirkan tekanan inflasi yang berlebihan.\n\nPasar futures dana fed sekarang menetapkan probabilitas 78% untuk pemangkasan 25 basis poin pada pertemuan Maret, naik dari 42% seminggu yang lalu. EUR/USD merespons positif, naik 0.8% ke level 1.0890.", time: "4j lalu", impact: "TINGGI", sent: "BEARISH", g: "from-blue-500 to-teal-700", src: "Reuters ID", read: "6 menit" },
  { id: 3, cat: "Emas", title: "Emas Sentuh $2.050, Permintaan Safe-Haven Meningkat", excerpt: "Logam mulia rally di tengah ketegangan Timur Tengah.", content: "Harga emas mencapai level tertinggi baru $2.050 per troy ounce, didorong oleh permintaan safe-haven di tengah meningkatnya ketegangan geopolitik di Timur Tengah dan pembelian agresif dari bank sentral global.\n\nEmas telah menguat hampir 15% sejak awal tahun, menjadikannya salah satu aset berkinerja terbaik di 2025. Bank sentral Tiongkok, India, dan Turki terus menambah cadangan emas mereka, sementara investor ritel juga beralih ke logam mulia sebagai lindung nilai terhadap ketidakpastian ekonomi.", time: "5j lalu", impact: "SEDANG", sent: "BULLISH", g: "from-amber-400 to-orange-700", src: "Bloomberg ID", read: "5 menit" },
  { id: 4, cat: "Tech", title: "Model AI Prediksi 94% Akurasi di Pergerakan Nasdaq", excerpt: "Arsitektur deep learning baru tunjukkan akurasi belum pernah terjadi sebelumnya.", content: "Sebuah startup fintech mengumumkan bahwa model deep learning proprietary mereka telah mencapai akurasi prediksi 94% pada pergerakan indeks Nasdaq dalam pengujian backtest 12 bulan terakhir.\n\nModel ini menggunakan arsitektur transformer yang dimodifikasi, menggabungkan analisis sentimen berita, data order flow, dan pola teknikal untuk menghasilkan sinyal trading. Perusahaan mengklaim model mereka memproses lebih dari 2 juta titik data per detik.", time: "8j lalu", impact: "SEDANG", sent: "BULLISH", g: "from-violet-500 to-pink-700", src: "TechCrunch ID", read: "7 menit" },
  { id: 5, cat: "Crypto", title: "Persetujuan ETF Ethereum Didalam 30 Hari", excerpt: "Komisaris SEC isyaratkan persetujuan ETF ETH spot segera.", content: "Komisaris Securities and Exchange Commission memberikan petunjuk bahwa persetujuan ETF Ethereum spot mungkin terjadi dalam 30 hari ke depan, memicu gelombang pembelian spekulatif di bursa crypto.\n\nEthereum merespons positif dengan kenaikan 12% dalam 24 jam terakhir, sementara token DeFi utama juga mengikuti rally.", time: "10j lalu", impact: "TINGGI", sent: "BULLISH", g: "from-violet-600 to-pink-700", src: "The Block ID", read: "5 menit" },
  { id: 6, cat: "Analisa", title: "EUR/USD: Level Support Kunci Jelang Pertemuan ECB", excerpt: "Breakdown zona support kritis dan pola reversal potensial.", content: "Analisa teknikal mendalam pada pair EUR/USD menunjukkan beberapa zona support kritis yang akan diuji menjelang pertemuan European Central Bank minggu depan.\n\nLevel 1.0800 berfungsi sebagai support psikologis utama, sementara 1.0750 adalah level Fibonacci 61.8% dari rally terbaru. Pola double bottom berpotensi terbentuk jika harga mempertahankan level 1.0820 selama beberapa hari ke depan.", time: "12j lalu", impact: "SEDANG", sent: "NETRAL", g: "from-emerald-400 to-cyan-700", src: "FXStreet ID", read: "8 menit" },
];

export const CATS = ["Semua", "Crypto", "Forex", "Emas", "Indeks"];
export const NEWS_CATS = ["Semua", "Crypto", "Forex", "Emas", "Tech", "Analisa"];

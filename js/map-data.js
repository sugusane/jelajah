// JELAJAH (jelajah.tech) — Master Data Tantangan & Lokasi Expo PMW
window.JELAJAH_DATA = {
  eventName: "Expo Wirausaha PMW 2026",
  domain: "jelajah.tech",
  adminPin: "1945", // PIN default staf penukaran hadiah
  
  // Titik Tantangan di Peta (Sesuai Denah)
  locations: [
    // --- SPOT KHUSUS LUAR BOOTH ---
    {
      id: "spot-masuk-1",
      category: "special",
      zone: "Pintu Masuk Barat",
      name: "Gate Masuk 1 (Zona Kuliner)",
      shortLabel: "IN-1",
      boothType: "Spot Publik",
      type: "checkin",
      points: 15,
      icon: "🚪",
      isQuickRoute: true,
      coords: { x: 38.5, y: 78.5 }, // Di dekat tanda MASUK lajur 1
      title: "Check-in Selamat Datang",
      desc: "Selamat datang di Expo PMW! Dapatkan poin perdanamu dengan melakukan check-in di pintu masuk 1.",
      task: {
        type: "instant",
        prompt: "Tekan tombol konfirmasi kehadiranmu di Gate Masuk 1.",
        btnText: "Konfirmasi Check-in Masuk"
      }
    },
    {
      id: "spot-masuk-2",
      category: "special",
      zone: "Pintu Masuk Timur",
      name: "Gate Masuk 2 (Zona Sponsor)",
      shortLabel: "IN-2",
      boothType: "Spot Publik",
      type: "trivia",
      points: 15,
      icon: "🎯",
      coords: { x: 67.5, y: 78.5 }, // Di dekat tanda MASUK lajur 2
      title: "Tebak Slogan Acara",
      desc: "Sebelum mulai berkeliling, uji pengetahuanmu tentang semangat expo hari ini!",
      task: {
        type: "quiz",
        question: "Apa tujuan utama diadakannya Expo Wirausaha Kampus?",
        options: [
          "Membantu mahasiswa memasarkan inovasi & produk wirausaha",
          "Hanya ajang berkumpul tanpa transaksi",
          "Kompetisi tidur terlama di kampus",
          "Menghabiskan anggaran tahunan"
        ],
        answerIndex: 0
      }
    },
    {
      id: "spot-stage",
      category: "special",
      zone: "Stage Utama",
      name: "Panggung Utama PMW",
      shortLabel: "STAGE",
      boothType: "Panggung",
      type: "photo",
      points: 25,
      icon: "🎤",
      isQuickRoute: true,
      coords: { x: 8.5, y: 39 }, // Di tengah Stage Utama
      title: "Selfie Semangat Panggung",
      desc: "Ambil foto selfie dengan latar belakang Stage Utama atau keseruan audiens panggung!",
      task: {
        type: "photo",
        prompt: "Unggah foto selfiemu dengan latar Stage Utama expo.",
        btnText: "Ambil / Unggah Foto"
      }
    },
    {
      id: "spot-tengah",
      category: "special",
      zone: "Lorong Publik",
      name: "Plaza Foto Tengah",
      shortLabel: "FOTO",
      boothType: "Spot Publik",
      type: "trivia",
      points: 20,
      icon: "📸",
      coords: { x: 38.5, y: 36 }, // Lorong antar booth makan
      title: "Eksplorasi Koridor Tengah",
      desc: "Tahukah kamu inovasi apa yang paling diminati generasi muda saat ini di bidang wirausaha?",
      task: {
        type: "quiz",
        question: "Teknologi apa yang dimanfaatkan oleh JELAJAH untuk meramaikan expo ini?",
        options: [
          "Gamifikasi Peta Interaktif & Web App Frictionless",
          "Koran dinding manual",
          "Surat berantai pos",
          "Sinyal asap panggung"
        ],
        answerIndex: 0
      }
    },

    // --- KLASTER BOOTH MAKANAN 1-12 ---
    {
      id: "booth-makan-1",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 1: Kopi Susu Aren Senja",
      shortLabel: "B1",
      boothNum: "1",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "☕",
      isQuickRoute: true,
      coords: { x: 28.5, y: 11.5 },
      title: "Menu Andalan Booth 1",
      desc: "Kunjungi Booth 1 dan cari tahu racikan kopi favorit para mahasiswa!",
      secretCode: "KOPI01",
      task: {
        type: "quiz",
        question: "Apa biji kopi khas Jawa Timur yang menjadi dasar racikan Kopi Aren Senja di Booth 1?",
        options: [
          "Robusta Dampit Malang",
          "Kopi Instan Sachet",
          "Biji Bunga Matahari",
          "Kopi Decaf Import"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-2",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 2: Dimsum Mentai Lumer",
      shortLabel: "B2",
      boothNum: "2",
      boothType: "Kuliner",
      type: "code",
      points: 20,
      icon: "🥟",
      coords: { x: 28.5, y: 19.5 },
      title: "Tanya Kode Rahasia Booth 2",
      desc: "Datang ke Booth 2, sapa penjaga booth dengan ramah, dan minta KODE RAHASIA JELAJAH di meja kasir!",
      secretCode: "DIMSUM2",
      task: {
        type: "secret_code",
        hint: "Tanyakan langsung ke kasir Booth 2 atau lihat stiker kode di meja kasir.",
        placeholder: "Contoh: DIMSUM2"
      }
    },
    {
      id: "booth-makan-3",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 3: Rice Bowl Sambal Matah",
      shortLabel: "B3",
      boothNum: "3",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "🍚",
      coords: { x: 28.5, y: 27.5 },
      title: "Sensasi Pedas Booth 3",
      desc: "Buktikan kecintaanmu pada masakan pedas Nusantara di booth wirausaha mahasiswa ini.",
      secretCode: "MATAH3",
      task: {
        type: "quiz",
        question: "Berapa level kepedasan tertinggi sambal matah yang ditawarkan Booth 3?",
        options: [
          "Level 5 (Super Geledek)",
          "Hanya ada level 0 (Manis)",
          "Level 100",
          "Level Tak Terhingga"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-4",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 4: Churros & Croffle Garing",
      shortLabel: "B4",
      boothNum: "4",
      boothType: "Kuliner",
      type: "code",
      points: 20,
      icon: "🧇",
      coords: { x: 28.5, y: 44.5 },
      title: "Topping Favorit Booth 4",
      desc: "Cari tahu kode unik di display booth pastry favorit ini!",
      secretCode: "CROFFLE4",
      task: {
        type: "secret_code",
        hint: "Kode rahasia tertera di sebelah menu promo Booth 4.",
        placeholder: "Ketik kode di sini"
      }
    },
    {
      id: "booth-makan-5",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 5: Es Teh Buah Tropis",
      shortLabel: "B5",
      boothNum: "5",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "🍹",
      coords: { x: 28.5, y: 55.5 },
      title: "Kesegaran Booth 5",
      desc: "Pelepas dahaga paling dicari pengunjung expo saat cuaca terik!",
      secretCode: "ESTEH5",
      task: {
        type: "quiz",
        question: "Varian buah segar apa yang menjadi best seller di Booth 5?",
        options: [
          "Peach Jasmine & Lemon Markisa",
          "Durian Bakar",
          "Pare Pahit",
          "Bawang Bombay"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-6",
      category: "makanan",
      zone: "Klaster Makanan A",
      name: "Booth 6: Burger Geprek Mozzarella",
      shortLabel: "B6",
      boothNum: "6",
      boothType: "Kuliner",
      type: "photo",
      points: 25,
      icon: "🍔",
      coords: { x: 28.5, y: 67.5 },
      title: "Foto Depan Booth 6",
      desc: "Ambil foto kreasi burger unik atau banner promo di Booth 6!",
      secretCode: "BURGER6",
      task: {
        type: "photo",
        prompt: "Upload foto keseruan di sekitar Booth 6 Burger Geprek.",
        btnText: "Ambil / Unggah Foto"
      }
    },

    // Blok Makanan 7-12
    {
      id: "booth-makan-7",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 7: Takoyaki Gurita Jumbo",
      shortLabel: "B7",
      boothNum: "7",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "🐙",
      coords: { x: 52.5, y: 11.5 },
      title: "Jajanan Khas Jepang Booth 7",
      desc: "Kelezatan potongan gurita asli dengan taburan katsuobushi melimpah.",
      secretCode: "TAKO07",
      task: {
        type: "quiz",
        question: "Bahan taburan gurih tipis di atas Takoyaki Booth 7 yang bergerak-gerak disebut?",
        options: [
          "Katsuobushi (serpihan cakalang asap)",
          "Kertas minyak halus",
          "Keju parut basi",
          "Daun kering taman"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-8",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 8: Matcha Oat Latte Bar",
      shortLabel: "B8",
      boothNum: "8",
      boothType: "Kuliner",
      type: "code",
      points: 20,
      icon: "🍵",
      coords: { x: 52.5, y: 19.5 },
      title: "Kode Matcha Sehat Booth 8",
      desc: "Minuman sehat kekinian dengan susu oat plant-based berkualitas tinggi.",
      secretCode: "MATCHA8",
      task: {
        type: "secret_code",
        hint: "Mintalah kode rahasia kepada barista Booth 8!",
        placeholder: "Masukkan kode"
      }
    },
    {
      id: "booth-makan-9",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 9: Cireng Bumbu Rujak Salju",
      shortLabel: "B9",
      boothNum: "9",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "🌶️",
      coords: { x: 52.5, y: 27.5 },
      title: "Camilan Tradisional Modern",
      desc: "Tekstur kenyal renyah dengan cocolan sambal rujak gula aren pedas manis.",
      secretCode: "CIRENG9",
      task: {
        type: "quiz",
        question: "Bahan tepung utama pembuat cireng di Booth 9 adalah?",
        options: [
          "Tepung Tapioka (Aci)",
          "Tepung Beras Ketan Hitam",
          "Tepung Semen",
          "Tepung Jagung Manis"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-10",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 10: Tteokbokki & Odeng Korea",
      shortLabel: "B10",
      boothNum: "10",
      boothType: "Kuliner",
      type: "code",
      points: 20,
      icon: "🍢",
      coords: { x: 52.5, y: 44.5 },
      title: "Street Food Seoul Booth 10",
      desc: "Nikmati hangatnya kuah kaldu odeng dan saus gochujang autentik.",
      secretCode: "KOREA10",
      task: {
        type: "secret_code",
        hint: "Lihat kode stiker JELAJAH di depan gerobak Booth 10.",
        placeholder: "Ketik kode rahasia"
      }
    },
    {
      id: "booth-makan-11",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 11: Gelato Buah Lokal Segar",
      shortLabel: "B11",
      boothNum: "11",
      boothType: "Kuliner",
      type: "quiz",
      points: 20,
      icon: "🍨",
      coords: { x: 52.5, y: 55.5 },
      title: "Gelato Wirausaha Booth 11",
      desc: "Dibuat langsung dari buah-buahan segar petani lokal binaan kampus.",
      secretCode: "GELATO11",
      task: {
        type: "quiz",
        question: "Mengapa gelato lebih padat dan creamy dibanding es krim biasa?",
        options: [
          "Kandungan lemak susu lebih seimbang dan udara yang masuk lebih sedikit",
          "Ditambahkan lem makanan khusus",
          "Dibekukan dengan nitrogen selama 1 tahun",
          "Karena dibuat tanpa susu sama sekali"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-makan-12",
      category: "makanan",
      zone: "Klaster Makanan B",
      name: "Booth 12: Kebab Daging Asap Special",
      shortLabel: "B12",
      boothNum: "12",
      boothType: "Kuliner",
      type: "code",
      points: 20,
      icon: "🌯",
      coords: { x: 52.5, y: 67.5 },
      title: "Daging Asap Aromatik Booth 12",
      desc: "Daging asap lezat berpadu keju lumer dan saus racikan spesial.",
      secretCode: "KEBAB12",
      task: {
        type: "secret_code",
        hint: "Kunjungi Booth 12 dan temukan kode rahasia di tent card kasir.",
        placeholder: "Kode 7 huruf"
      }
    },

    // --- KLASTER BOOTH SPONSOR A - M ---
    {
      id: "booth-sponsor-a",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth A: Bank Syariah Indonesia (BSI)",
      shortLabel: "A",
      boothLetter: "A",
      boothType: "Sponsor Utama",
      type: "quiz",
      points: 25,
      icon: "🏦",
      coords: { x: 74.5, y: 9.5 },
      title: "Solusi Finansial Mahasiswa",
      desc: "Kenali kemudahan transaksi digital kampus dan pembukaan rekening online.",
      secretCode: "BSI2026",
      task: {
        type: "quiz",
        question: "Aplikasi mobile banking resmi dari BSI untuk kemudahan transaksi QRIS adalah?",
        options: [
          "BSI Mobile / BYOND by BSI",
          "Game Mobile Legends",
          "Aplikasi Tiket Bioskop",
          "Kalkulator Biasa"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-b",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth B: Telkomsel Digital Ecosystem",
      shortLabel: "B",
      boothLetter: "B",
      boothType: "Sponsor Teknologi",
      type: "code",
      points: 25,
      icon: "📶",
      coords: { x: 74.5, y: 15.0 },
      title: "Koneksi 5G & Promo Kuota",
      desc: "Kunjungi booth Telkomsel, tanyakan paket kuota khusus mahasiswa untuk dapatkan kodenya!",
      secretCode: "BYU2026",
      task: {
        type: "secret_code",
        hint: "Dapatkan kode rahasia langsung dari kru Telkomsel di Booth B.",
        placeholder: "Ketik kode di sini"
      }
    },
    {
      id: "booth-sponsor-c",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth C: Paragon Corp (Wardah & Kahf)",
      shortLabel: "C",
      boothLetter: "C",
      boothType: "Sponsor Beauty & Grooming",
      type: "quiz",
      points: 25,
      icon: "✨",
      isQuickRoute: true,
      coords: { x: 74.5, y: 20.5 },
      title: "Skin Check & Edukasi Perawatan",
      desc: "Konsultasi kesehatan kulit gratis dan diskon produk perawatan harian.",
      secretCode: "KAHF26",
      task: {
        type: "quiz",
        question: "Brand perawatan diri pria dari Paragon yang terkenal dengan aroma alami adalah?",
        options: [
          "Kahf",
          "Pasta Gigi Anak",
          "Oli Mesin",
          "Cat Minyak"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-d",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth D: Ruangguru & Skill Academy",
      shortLabel: "D",
      boothLetter: "D",
      boothType: "Sponsor Pendidikan",
      type: "code",
      points: 25,
      icon: "📚",
      coords: { x: 74.5, y: 26.0 },
      title: "Klaim Tes Minat Karir",
      desc: "Ikuti tes bakat singkat di Booth D dan catat kode voucher belajar gratis!",
      secretCode: "PINTAR26",
      task: {
        type: "secret_code",
        hint: "Kode diberikan setelah mencoba mini assessment di tablet Booth D.",
        placeholder: "Kode promo Booth D"
      }
    },
    {
      id: "booth-sponsor-e",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth E: E-Commerce & Logistic Partner (J&T)",
      shortLabel: "E",
      boothLetter: "E",
      boothType: "Sponsor Logistik",
      type: "quiz",
      points: 25,
      icon: "📦",
      coords: { x: 74.5, y: 31.5 },
      title: "Ekspedisi Bisnis Mahasiswa",
      desc: "Dukung pengiriman produk wirausaha kampus ke seluruh penjuru Nusantara.",
      secretCode: "KIRIM26",
      task: {
        type: "quiz",
        question: "Keunggulan layanan jemput paket (pick up) gratis bagi wirausahawan adalah?",
        options: [
          "Menghemat waktu tanpa harus mengantre di counter kurir",
          "Paket otomatis lenyap ke udara",
          "Harus bayar ongkos jalan kaki",
          "Hanya bisa kirim surat cinta"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-f",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth F: Hydro Coco & Kalbe Nutrition",
      shortLabel: "F",
      boothLetter: "F",
      boothType: "Sponsor Minuman Sehat",
      type: "code",
      points: 25,
      icon: "🥥",
      coords: { x: 74.5, y: 37.0 },
      title: "Uji Elektrolit Tubuhmu",
      desc: "Cicipi hidrasi alami air kelapa murni dan ambil kode rahasianya.",
      secretCode: "SEHAT26",
      task: {
        type: "secret_code",
        hint: "Kode rahasia ada di kemasan dummy raksasa Hydro Coco Booth F.",
        placeholder: "Masukkan kode"
      }
    },
    {
      id: "booth-sponsor-g",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth G: Startup Incubator & Coworking",
      shortLabel: "G",
      boothLetter: "G",
      boothType: "Sponsor Startup",
      type: "quiz",
      points: 25,
      icon: "💡",
      coords: { x: 74.5, y: 42.5 },
      title: "Akselerasi Ide Bisnis",
      desc: "Dapatkan kesempatan mentoring dan pendanaan hibah wirausaha.",
      secretCode: "PITCH26",
      task: {
        type: "quiz",
        question: "Apa arti istilah MVP dalam pengembangan produk teknologi baru?",
        options: [
          "Minimum Viable Product (Produk versi awal berfitur inti)",
          "Most Valuable Player dalam game MOBA",
          "Makan Video Podcast",
          "Mobil Van Pribadi"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-h",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth H: Yamaha Motor Indonesia",
      shortLabel: "H",
      boothLetter: "H",
      boothType: "Sponsor Otomotif",
      type: "photo",
      points: 30,
      icon: "🏍️",
      coords: { x: 74.5, y: 48.0 },
      title: "Foto Keren Bersama Motor Sport",
      desc: "Pose keren di booth display motor Yamaha dan upload fotomu!",
      secretCode: "YAMAHA26",
      task: {
        type: "photo",
        prompt: "Upload fotomu bersama unit motor yang dipajang di Booth H.",
        btnText: "Ambil / Unggah Foto"
      }
    },
    {
      id: "booth-sponsor-i",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth I: Gramedia Bookstore & Merch",
      shortLabel: "I",
      boothLetter: "I",
      boothType: "Sponsor Literasi",
      type: "quiz",
      points: 25,
      icon: "📖",
      coords: { x: 74.5, y: 53.5 },
      title: "Kuis Wawasan Buku Bisnis",
      desc: "Temukan koleksi buku best-seller wirausaha dengan diskon spesial expo.",
      secretCode: "BUKU26",
      task: {
        type: "quiz",
        question: "Penulis buku bisnis legendaris 'Rich Dad Poor Dad' adalah?",
        options: [
          "Robert T. Kiyosaki",
          "Sherlock Holmes",
          "Harry Potter",
          "Tony Stark"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-j",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth J: Kopi Kenangan & Chigo",
      shortLabel: "J",
      boothLetter: "J",
      boothType: "Sponsor F&B Chain",
      type: "code",
      points: 25,
      icon: "🍗",
      coords: { x: 74.5, y: 59.0 },
      title: "Voucher Diskon Grab-and-Go",
      desc: "Scan QR di Booth J untuk aktivasi promo Buy 1 Get 1 di aplikasi!",
      secretCode: "KENANGAN26",
      task: {
        type: "secret_code",
        hint: "Minta kode promo ke staf kasir Booth J.",
        placeholder: "Kode rahasia Booth J"
      }
    },
    {
      id: "booth-sponsor-k",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth K: Emina Cosmetics Glow Spot",
      shortLabel: "K",
      boothLetter: "K",
      boothType: "Sponsor Kecantikan Remaja",
      type: "quiz",
      points: 25,
      icon: "🌸",
      coords: { x: 74.5, y: 64.5 },
      title: "Sunscreen Protection Quiz",
      desc: "Cek pentingnya perlindungan kulit dari paparan sinar UV matahari saat beraktivitas.",
      secretCode: "GLOW26",
      task: {
        type: "quiz",
        question: "Berapa jam sekali sunscreen sebaiknya di-reapply saat berada di luar ruangan?",
        options: [
          "Setiap 2 - 3 jam sekali",
          "Cukup 1 kali setahun",
          "Hanya saat malam hari",
          "Tidak perlu diulang sama sekali"
        ],
        answerIndex: 0
      }
    },
    {
      id: "booth-sponsor-l",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth L: Cinema XXI & M-Tix",
      shortLabel: "L",
      boothLetter: "L",
      boothType: "Sponsor Hiburan",
      type: "code",
      points: 25,
      icon: "🍿",
      coords: { x: 74.5, y: 70.0 },
      title: "Tebak Film & Kode Popcorn",
      desc: "Mainkan mini game tebak poster film di tablet Booth L!",
      secretCode: "NONTON26",
      task: {
        type: "secret_code",
        hint: "Ketik kode kupon popcorn yang dibagikan kru XXI di Booth L.",
        placeholder: "Kode 8 karakter"
      }
    },
    {
      id: "booth-sponsor-m",
      category: "sponsor",
      zone: "Deretan Mitra Sponsor",
      name: "Booth M: Tokopedia by TikTok Shop",
      shortLabel: "M",
      boothLetter: "M",
      boothType: "Sponsor E-Commerce",
      type: "quiz",
      points: 25,
      icon: "🛍️",
      coords: { x: 74.5, y: 75.5 },
      title: "Live Shopping Experience",
      desc: "Pelajari cara berwirausaha dengan teknik live streaming interaktif kekinian.",
      secretCode: "SHOP26",
      task: {
        type: "quiz",
        question: "Fitur yang memungkinkan audiens membeli barang langsung saat creator live streaming dinamakan?",
        options: [
          "Live Shopping Cart / Keranjang Kuning",
          "Kotak Pos Kayu",
          "Faksimili Kilat",
          "Telepon Umum Koin"
        ],
        answerIndex: 0
      }
    }
  ],

  // Katalog Hadiah yang Dapat Ditukarkan
  rewards: [
    {
      id: "rw-sticker",
      name: "Stiker Hologram JELAJAH Expo",
      category: "merch",
      icon: "✨",
      cost: 35,
      stock: 120,
      sponsor: "Official JELAJAH",
      desc: "Stiker vinyl tahan air edisi terbatas 'JELAJAH Expo PMW 2026' dengan efek hologram eksklusif.",
      pickupLocation: "Booth Panitia JELAJAH (Dekat Panggung)"
    },
    {
      id: "rw-voucher-3k",
      name: "Voucher Diskon Rp 3.000 Kuliner",
      category: "voucher",
      icon: "🎟️",
      cost: 50,
      stock: 85,
      sponsor: "Sponsor UMKM Kampus",
      desc: "Potongan langsung Rp 3.000 tanpa minimum belanja di seluruh Booth Makanan 1 sampai 6!",
      pickupLocation: "Tunjukkan kupon langsung ke kasir Booth 1-6"
    },
    {
      id: "rw-ganci",
      name: "Gantungan Kunci Akrilik JELAJAH",
      category: "merch",
      icon: "🔑",
      cost: 75,
      stock: 60,
      sponsor: "Official JELAJAH",
      desc: "Gantungan kunci akrilik tebal dua sisi maskot petualang JELAJAH, keren dipasang di tas atau kunci motormu.",
      pickupLocation: "Booth Panitia JELAJAH (Dekat Panggung)"
    },
    {
      id: "rw-voucher-5k",
      name: "Voucher Diskon Rp 5.000 Kuliner",
      category: "voucher",
      icon: "🏷️",
      cost: 90,
      stock: 40,
      sponsor: "Sponsor Kuliner Premium",
      desc: "Potongan langsung Rp 5.000 di seluruh Booth Makanan 7 sampai 12 (min. transaksi Rp 15.000).",
      pickupLocation: "Tunjukkan kupon langsung ke kasir Booth 7-12"
    },
    {
      id: "rw-totebag",
      name: "Totebag Kanvas Sponsor & Pin Enamel",
      category: "premium",
      icon: "👜",
      cost: 140,
      stock: 25,
      sponsor: "Paragon & Telkomsel",
      desc: "Totebag kanvas premium tebal dengan sablon festival + paket pin enamel dan sample produk sponsor.",
      pickupLocation: "Booth Panitia JELAJAH (Dekat Panggung)"
    },
    {
      id: "rw-grandprize",
      name: "Tiket Undian Grand Prize Panggung",
      category: "special",
      icon: "🏆",
      cost: 180,
      stock: 100,
      sponsor: "BSI & Yamaha",
      desc: "1 nomor undian berhadiah Smartwatch & Helm Eksklusif yang akan diundi di Panggung Utama saat penutupan expo!",
      pickupLocation: "Booth Panitia JELAJAH (Dekat Panggung)"
    }
  ],

  // Data Awal Leaderboard Simulasi (Realistis untuk Expo)
  initialLeaderboard: [
    { rank: 1, name: "Fathur Rahman", score: 265, completed: 11, badge: "Master Explorer" },
    { rank: 2, name: "Nadia Safitri", score: 240, completed: 10, badge: "Foodie Hunter" },
    { rank: 3, name: "Dimas Arya", score: 215, completed: 9, badge: "Sponsor Scout" },
    { rank: 4, name: "Siti Nurhaliza", score: 180, completed: 8, badge: "Active Adventurer" },
    { rank: 5, name: "Kevin Chandra", score: 160, completed: 7, badge: "Campus Rover" },
    { rank: 6, name: "Rizky Pratama", score: 140, completed: 6, badge: "Explorer" },
    { rank: 7, name: "Ayu Wulandari", score: 120, completed: 5, badge: "Explorer" },
    { rank: 8, name: "Bima Satria", score: 95, completed: 4, badge: "Beginner" }
  ]
};

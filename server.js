// JELAJAH (jelajah.tech) — Backend Server & REST API (Secured & Dynamic)
// Expo Wirausaha PMW 2026 · UPN "Veteran" Jawa Timur

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const vm = require('vm');

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname);
const DB_FILE = path.join(BASE_DIR, 'data', 'expo-db.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'jelajah1945';
const AUTH_SALT = 'JELAJAH_SALT_2026_PMW';

// Sesi panitia aktif & Pelacak Pengunjung Online
const adminSessions = new Map(); // token -> timestamp
const activeVisitors = new Map(); // visitorKey -> timestamp

function recordActiveVisitor(id) {
  if (!id) return;
  activeVisitors.set(id, Date.now());
}

function getActiveVisitorsCount() {
  const cutoff = Date.now() - 45000; // Kadaluarsa setelah 45 detik tidak ada ping
  for (const [id, ts] of activeVisitors.entries()) {
    if (ts < cutoff) activeVisitors.delete(id);
  }
  return Math.max(1, activeVisitors.size);
}

// --- DAFTAR FALLBACK MISI & POIN STANDAR ---
const OFFICIAL_MISSIONS = {
  // Spot Khusus
  "spot-masuk-1": 15,
  "spot-masuk-2": 15,
  "spot-stage": 25,
  "spot-tengah": 20,

  // Klaster Makanan 1-12
  "booth-makan-1": 20, "booth-1": 20,
  "booth-makan-2": 20, "booth-2": 20,
  "booth-makan-3": 20, "booth-3": 20,
  "booth-makan-4": 20, "booth-4": 20,
  "booth-makan-5": 20, "booth-5": 20,
  "booth-makan-6": 25, "booth-6": 25,
  "booth-makan-7": 20, "booth-7": 20,
  "booth-makan-8": 20, "booth-8": 20,
  "booth-makan-9": 20, "booth-9": 20,
  "booth-makan-10": 20, "booth-10": 20,
  "booth-makan-11": 20, "booth-11": 20,
  "booth-makan-12": 20, "booth-12": 20,

  // Klaster Sponsor A-M
  "booth-sponsor-a": 25, "booth-a": 25,
  "booth-sponsor-b": 25, "booth-b": 25,
  "booth-sponsor-c": 25, "booth-c": 25,
  "booth-sponsor-d": 25, "booth-d": 25,
  "booth-sponsor-e": 25, "booth-e": 25,
  "booth-sponsor-f": 25, "booth-f": 25,
  "booth-sponsor-g": 25, "booth-g": 25,
  "booth-sponsor-h": 30, "booth-h": 30,
  "booth-sponsor-i": 25, "booth-i": 25,
  "booth-sponsor-j": 25, "booth-j": 25,
  "booth-sponsor-k": 25, "booth-k": 25,
  "booth-sponsor-l": 25, "booth-l": 25,
  "booth-sponsor-m": 25, "booth-m": 25
};

const DEFAULT_REWARDS = [
  { id: "rw-sticker", name: "Stiker Hologram JELAJAH Expo", cost: 35, stock: 120, sponsor: "Official JELAJAH" },
  { id: "rw-voucher-3k", name: "Voucher Diskon Rp 3.000 Kuliner", cost: 50, stock: 85, sponsor: "Sponsor UMKM Kampus" },
  { id: "rw-ganci", name: "Gantungan Kunci Akrilik JELAJAH", cost: 75, stock: 60, sponsor: "Official JELAJAH" },
  { id: "rw-voucher-5k", name: "Voucher Diskon Rp 5.000 Kuliner", cost: 90, stock: 40, sponsor: "Sponsor Kuliner Premium" },
  { id: "rw-totebag", name: "Totebag Kanvas Sponsor & Pin Enamel", cost: 140, stock: 25, sponsor: "Paragon & Telkomsel" },
  { id: "rw-grandprize", name: "Tiket Undian Grand Prize Panggung", cost: 180, stock: 100, sponsor: "BSI & Yamaha" }
];

// Helper membaca master misi default dari js/map-data.js jika DB kosong
function getDefaultLocations() {
  try {
    const mapDataFile = path.join(BASE_DIR, 'js', 'map-data.js');
    if (fs.existsSync(mapDataFile)) {
      const code = fs.readFileSync(mapDataFile, 'utf8');
      const ctx = { window: {} };
      vm.createContext(ctx);
      vm.runInContext(code, ctx);
      if (ctx.window && ctx.window.JELAJAH_DATA && Array.isArray(ctx.window.JELAJAH_DATA.locations)) {
        return ctx.window.JELAJAH_DATA.locations;
      }
    }
  } catch (e) {
    console.error('Gagal membaca map-data.js untuk default missions:', e.message);
  }
  return [];
}

// --- DATABASE IN-MEMORY DENGAN PERSISTENSI FILE ---
function loadDB() {
  let loaded = null;
  try {
    if (fs.existsSync(DB_FILE)) {
      loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Gagal membaca DB, menginisialisasi baru:', e.message);
  }

  const defaultMissions = getDefaultLocations();

  const data = loaded || {
    users: {},
    tickets: {},
    rewards: DEFAULT_REWARDS,
    missions: defaultMissions,
    devices: {}
  };

  // Pastikan struktur field lengkap
  if (!data.users) data.users = {};
  if (!data.tickets) data.tickets = {};
  if (!data.rewards || !Array.isArray(data.rewards) || data.rewards.length === 0) data.rewards = DEFAULT_REWARDS;
  if (!data.missions || !Array.isArray(data.missions) || data.missions.length === 0) data.missions = defaultMissions;
  if (!data.devices) data.devices = {};

  return data;
}

const db = loadDB();

function saveDB() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Gagal menyimpan DB:', e.message);
  }
}

// Cari poin misi secara dinamis dari db.missions atau fallback
function getMissionPoints(missionId) {
  if (db.missions && Array.isArray(db.missions)) {
    const m = db.missions.find(loc => loc.id === missionId);
    if (m && typeof m.points === 'number') return m.points;

    // Cek alias jika ada
    const alias = db.missions.find(loc => {
      const shortMakan = loc.id.replace('booth-makan-', 'booth-');
      const shortSponsor = loc.id.replace('booth-sponsor-', 'booth-');
      return shortMakan === missionId || shortSponsor === missionId;
    });
    if (alias && typeof alias.points === 'number') return alias.points;
  }
  return OFFICIAL_MISSIONS[missionId] || 0;
}

// Helper autentikasi & sanitasi user
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(String(pwd) + AUTH_SALT).digest('hex');
}

function sanitizeUser(u) {
  if (!u) return null;
  const userTickets = Object.values(db.tickets).filter(t => t.userId === u.id);
  return {
    id: u.id,
    name: u.name,
    identifier: u.identifier || '',
    completedMissions: u.completedMissions || [],
    earnedPoints: u.earnedPoints || 0,
    spentPoints: u.spentPoints || 0,
    availablePoints: Math.max(0, (u.earnedPoints || 0) - (u.spentPoints || 0)),
    tickets: userTickets,
    deviceId: u.deviceId || 'unknown'
  };
}

// --- DETEKSI IP WIFI REAL (FILTER APIPA 169.254) ---
function getReachableIPs() {
  const interfaces = os.networkInterfaces();
  const validIPs = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        validIPs.push({
          interface: name,
          ip: iface.address,
          isWifi: name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || iface.address.startsWith('192.168.')
        });
      }
    }
  }

  validIPs.sort((a, b) => (b.isWifi ? 1 : 0) - (a.isWifi ? 1 : 0));
  return validIPs;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

// Parse request body with size limit (anti-DoS, max 64KB)
function parseRequestBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve) => {
    let body = '';
    let total = 0;
    req.on('data', chunk => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        resolve({});
      } else {
        body += chunk;
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Cek autentikasi admin (aman untuk local dan reverse proxy production Nginx)
function checkAdminAuth(req, parsedUrl) {
  const headerKey = req.headers['x-admin-key'];
  const queryKey = parsedUrl.searchParams.get('key');
  if (headerKey === ADMIN_KEY || queryKey === ADMIN_KEY) return true;

  const cookieHeader = req.headers.cookie || '';
  const cookieToken = (cookieHeader.match(/jelajah_admin_token=([^;]+)/) || [])[1];
  if (cookieToken && adminSessions.has(cookieToken)) return true;

  // Jika di local development tanpa reverse proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (!forwarded) {
    const clientIp = req.socket.remoteAddress || '';
    if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.endsWith('127.0.0.1')) {
      return true;
    }
  }
  return false;
}

// Generate token kriptografis yang unik dan aman
function generateSecureToken() {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return 'JLJ-' + rand;
}

// --- SERVER HTTP & ROUTER API ---
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ================= REST API ENDPOINTS =================

  // --- A. AUTHENTICATION & VISITORS (PENCEGAHAN MULTI-AKUN / ANTI-NUYUL) ---
  
  // POST /api/admin/login (Login Staf Panitia via PIN)
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    const pin = (body.pin || '').trim();
    if (pin === ADMIN_KEY || pin === '1945') {
      const token = crypto.randomBytes(16).toString('hex');
      adminSessions.set(token, Date.now());
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `jelajah_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({
        success: true,
        token,
        redirectUrl: `/admin.html?key=${ADMIN_KEY}`
      }));
    }
    return sendJSON(res, { error: 'PIN Panitia salah! Akses ditolak.' }, 401);
  }

  // POST /api/auth/register
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    const { name, identifier, password, deviceId } = body;

    if (!name || name.trim().length < 2) {
      return sendJSON(res, { error: 'Nama minimal 2 karakter!' }, 400);
    }
    if (!identifier || identifier.trim().length < 3) {
      return sendJSON(res, { error: 'NIM / No. WhatsApp / Email harus diisi dengan benar!' }, 400);
    }
    if (!password || password.trim().length < 4) {
      return sendJSON(res, { error: 'Password minimal 4 karakter!' }, 400);
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    
    // Cek apakah identifier sudah terdaftar
    const existingUser = Object.values(db.users).find(u => (u.identifier || '').toLowerCase() === cleanIdentifier);
    if (existingUser) {
      return sendJSON(res, { error: `NIM / No. WhatsApp / Email "${identifier}" sudah terdaftar! Silakan login.` }, 400);
    }

    const devId = deviceId || ('dev_' + crypto.randomBytes(6).toString('hex'));
    const userId = 'usr_' + crypto.randomBytes(4).toString('hex');

    const newUser = {
      id: userId,
      name: name.trim(),
      identifier: identifier.trim(),
      passwordHash: hashPassword(password),
      deviceId: devId,
      deviceIds: [devId],
      completedMissions: [],
      earnedPoints: 0,
      spentPoints: 0,
      tickets: [],
      createdAt: new Date().toISOString()
    };

    db.users[userId] = newUser;
    db.devices[devId] = db.devices[devId] || { claimedRewards: {}, users: [] };
    if (!db.devices[devId].users.includes(userId)) {
      db.devices[devId].users.push(userId);
    }

    saveDB();
    console.log(`[REGISTER] User baru terdaftar: ${newUser.name} (${newUser.identifier}) - Device: ${devId}`);

    return sendJSON(res, {
      success: true,
      user: sanitizeUser(newUser),
      message: 'Registrasi berhasil! Selamat menjelajahi Expo PMW.'
    });
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    const { identifier, password, deviceId } = body;

    if (!identifier || !password) {
      return sendJSON(res, { error: 'Harap masukkan identitas dan password!' }, 400);
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = Object.values(db.users).find(u => (u.identifier || '').toLowerCase() === cleanIdentifier);

    if (!user) {
      return sendJSON(res, { error: 'Akun dengan NIM/WhatsApp/Email tersebut tidak ditemukan. Silakan registrasi terlebih dahulu.' }, 404);
    }

    if (user.passwordHash && user.passwordHash !== hashPassword(password)) {
      return sendJSON(res, { error: 'Password salah!' }, 401);
    }

    // Update / tautkan device
    const devId = deviceId || user.deviceId || ('dev_' + crypto.randomBytes(6).toString('hex'));
    user.deviceIds = user.deviceIds || [];
    if (!user.deviceIds.includes(devId)) {
      user.deviceIds.push(devId);
    }
    user.deviceId = devId;

    db.devices[devId] = db.devices[devId] || { claimedRewards: {}, users: [] };
    if (!db.devices[devId].users.includes(user.id)) {
      db.devices[devId].users.push(user.id);
    }

    saveDB();
    console.log(`[LOGIN] User login: ${user.name} (${user.identifier})`);

    return sendJSON(res, {
      success: true,
      user: sanitizeUser(user),
      message: `Selamat datang kembali, ${user.name}!`
    });
  }

  // GET /api/auth/me?userId=...
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const userId = parsedUrl.searchParams.get('userId');
    const user = db.users[userId];
    if (user) {
      return sendJSON(res, { success: true, user: sanitizeUser(user) });
    }
    return sendJSON(res, { success: false, error: 'User tidak ditemukan' }, 404);
  }

  // --- B. MISSION & CHALLENGE BUILDER (FULL CUSTOMIZABLE OLEH ADMIN) ---

  // GET /api/missions (Publik: memuat daftar tantangan untuk peta dan kartu booth)
  if (pathname === '/api/missions' && req.method === 'GET') {
    return sendJSON(res, {
      success: true,
      missions: db.missions || []
    });
  }

  // POST /api/admin/missions (Tambah / Edit Misi)
  if (pathname === '/api/admin/missions' && req.method === 'POST') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin' }, 401);
    }

    const body = await parseRequestBody(req);
    const mission = body.mission;

    if (!mission || !mission.id || !mission.name) {
      return sendJSON(res, { error: 'Data misi tidak lengkap! ID dan Nama wajib diisi.' }, 400);
    }

    // Pastikan poin numerik valid
    mission.points = parseInt(mission.points) || 20;

    const existingIdx = db.missions.findIndex(m => m.id === mission.id);
    if (existingIdx >= 0) {
      // Update misi yang ada
      db.missions[existingIdx] = { ...db.missions[existingIdx], ...mission };
      console.log(`[ADMIN MISSION] Misi diperbarui: ${mission.id} (${mission.name})`);
    } else {
      // Tambah misi baru
      db.missions.push(mission);
      console.log(`[ADMIN MISSION] Misi baru ditambahkan: ${mission.id} (${mission.name})`);
    }

    saveDB();
    return sendJSON(res, {
      success: true,
      mission,
      totalMissions: db.missions.length,
      message: `Tantangan "${mission.name}" berhasil disimpan!`
    });
  }

  // DELETE /api/admin/missions (Hapus Misi)
  if (pathname === '/api/admin/missions' && (req.method === 'DELETE' || req.method === 'POST')) {
    if (req.method === 'POST' && !parsedUrl.searchParams.get('delete')) {
      // Lewati jika bukan endpoint hapus
    } else {
      if (!checkAdminAuth(req, parsedUrl)) {
        return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin' }, 401);
      }

      const body = await parseRequestBody(req);
      const missionId = body.id || parsedUrl.searchParams.get('id');

      if (!missionId) {
        return sendJSON(res, { error: 'ID Misi harus disertakan' }, 400);
      }

      const initialLen = db.missions.length;
      db.missions = db.missions.filter(m => m.id !== missionId);

      if (db.missions.length === initialLen) {
        return sendJSON(res, { error: `Misi dengan ID "${missionId}" tidak ditemukan` }, 404);
      }

      saveDB();
      console.log(`[ADMIN MISSION] Misi dihapus: ${missionId}`);

      return sendJSON(res, {
        success: true,
        message: `Misi "${missionId}" berhasil dihapus.`,
        totalMissions: db.missions.length
      });
    }
  }

  // POST /api/admin/missions/reset (Kembalikan ke Default Expo PMW)
  if (pathname === '/api/admin/missions/reset' && req.method === 'POST') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin' }, 401);
    }

    const defaultMissions = getDefaultLocations();
    if (defaultMissions.length > 0) {
      db.missions = defaultMissions;
      saveDB();
      console.log(`[ADMIN MISSION] Seluruh misi di-reset ke default (${db.missions.length} lokasi)`);
      return sendJSON(res, {
        success: true,
        message: 'Seluruh tantangan berhasil di-reset ke susunan resmi denah Expo PMW!',
        missions: db.missions
      });
    } else {
      return sendJSON(res, { error: 'Gagal memuat template default misi' }, 500);
    }
  }

  // --- C. SYNC & GAMIFIKASI PENGUNJUNG ---

  // 1. Sinkronisasi User & Skor
  // POST /api/user/sync
  if (pathname === '/api/user/sync' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    const { userId, name, completedMissions, deviceId } = body;

    if (!userId) {
      return sendJSON(res, { error: 'userId diperlukan' }, 400);
    }

    let u = db.users[userId];
    if (!u) {
      u = {
        id: userId,
        name: name || 'Penjelajah PMW',
        completedMissions: [],
        earnedPoints: 0,
        spentPoints: 0,
        tickets: [],
        deviceId: deviceId || 'unknown'
      };
      db.users[userId] = u;
    }

    if (name && !u.identifier) u.name = name;
    if (deviceId && !u.deviceId) u.deviceId = deviceId;

    // Sinkronkan daftar misi selesai
    if (Array.isArray(completedMissions)) {
      completedMissions.forEach(mId => {
        const pts = getMissionPoints(mId);
        if (pts > 0 && !u.completedMissions.includes(mId)) {
          u.completedMissions.push(mId);
        }
      });
    }

    // Hitung ulang total poin resmi dari server (server-side truth)
    let totalEarned = 0;
    u.completedMissions.forEach(mId => {
      totalEarned += getMissionPoints(mId);
    });
    u.earnedPoints = totalEarned;

    recordActiveVisitor(userId || deviceId || (req.socket.remoteAddress || 'visitor'));
    const liveVisitors = getActiveVisitorsCount();

    saveDB();

    return sendJSON(res, {
      success: true,
      user: sanitizeUser(u),
      rewards: db.rewards,
      liveVisitors
    });
  }

  // 2. Klaim Hadiah / Buat Tiket Penukaran (Anti-Nuyul & Anti-Double Claim)
  // POST /api/user/claim
  if (pathname === '/api/user/claim' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    const { userId, rewardId, completedMissions, name, deviceId } = body;

    let user = db.users[userId];
    if (!user) {
      user = {
        id: userId,
        name: name || 'Penjelajah PMW',
        completedMissions: [],
        earnedPoints: 0,
        spentPoints: 0,
        tickets: [],
        deviceId: deviceId || 'unknown'
      };
      db.users[userId] = user;
    }

    const devId = deviceId || user.deviceId;

    // Sinkronkan daftar misi selesai jika dikirim oleh client
    if (Array.isArray(completedMissions)) {
      completedMissions.forEach(mId => {
        const pts = getMissionPoints(mId);
        if (pts > 0 && !user.completedMissions.includes(mId)) {
          user.completedMissions.push(mId);
        }
      });
    }

    // Hitung ulang total poin resmi dari server
    let totalEarned = 0;
    user.completedMissions.forEach(mId => {
      totalEarned += getMissionPoints(mId);
    });
    user.earnedPoints = totalEarned;
    saveDB();

    const reward = db.rewards.find(r => r.id === rewardId);
    if (!reward) {
      return sendJSON(res, { error: 'Hadiah tidak ditemukan' }, 404);
    }

    // PERTAHANAN 1: Cek apakah USER INI sudah pernah mengklaim hadiah ini
    const existingTicket = Object.values(db.tickets).find(t => t.userId === userId && t.rewardId === rewardId);
    if (existingTicket) {
      if (existingTicket.status === 'DISBURSED') {
        return sendJSON(res, {
          error: `Kamu sudah pernah menukarkan voucher "${reward.name}" dan sudah diserahkan panitia pada ${existingTicket.disbursedAt}. Setiap pengunjung hanya berhak klaim 1x!`,
          isDuplicate: true,
          ticket: existingTicket
        }, 400);
      } else {
        return sendJSON(res, {
          success: true,
          isExisting: true,
          ticket: existingTicket,
          message: 'Kamu sudah memiliki tiket aktif untuk hadiah ini. Tunjukkan ke meja panitia!'
        });
      }
    }

    // PERTAHANAN 2 (ANTI-NUYUL): Cek apakah PERANGKAT (DEVICE) INI sudah pernah menukar hadiah ini
    if (devId && devId !== 'unknown') {
      const devRecord = db.devices[devId];
      if (devRecord && devRecord.claimedRewards && devRecord.claimedRewards[rewardId]) {
        const prevToken = devRecord.claimedRewards[rewardId];
        const prevTicket = db.tickets[prevToken];
        return sendJSON(res, {
          error: `Perangkat HP ini sudah pernah digunakan untuk mengklaim hadiah "${reward.name}" (Kode: ${prevToken}). Demi asas keadilan seluruh pengunjung, 1 perangkat dibatasi 1x penukaran per hadiah!`,
          isDeviceBlocked: true,
          ticket: prevTicket
        }, 400);
      }
    }

    // Cek kecukupan poin
    const availablePoints = Math.max(0, user.earnedPoints - user.spentPoints);
    if (availablePoints < reward.cost) {
      return sendJSON(res, { error: `Poin tidak cukup! Butuh ${reward.cost} pts, kamu punya ${availablePoints} pts.` }, 400);
    }

    // Cek sisa stok
    if (reward.stock <= 0) {
      return sendJSON(res, { error: 'Stok hadiah ini sudah habis!' }, 400);
    }

    // Kurangi poin user & kurangi stok hadiah
    user.spentPoints += reward.cost;
    reward.stock--;

    // Buat kode tiket unik kriptografis
    const token = generateSecureToken();
    const newTicket = {
      token,
      userId: user.id,
      userName: user.name,
      userIdentifier: user.identifier || '-',
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      deviceId: devId || 'unknown',
      status: 'PENDING', // PENDING -> DISBURSED
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      disbursedAt: null
    };

    db.tickets[token] = newTicket;

    // Kunci perangkat agar tidak bisa nuyul dengan akun baru
    if (devId && devId !== 'unknown') {
      db.devices[devId] = db.devices[devId] || { claimedRewards: {}, users: [] };
      db.devices[devId].claimedRewards[reward.id] = token;
      if (!db.devices[devId].users.includes(user.id)) {
        db.devices[devId].users.push(user.id);
      }
    }

    saveDB();

    console.log(`[KLAIM BARU] ${user.name} (${user.identifier || '-'}) mengklaim ${reward.name} (Kode: ${token}, Dev: ${devId})`);

    return sendJSON(res, {
      success: true,
      ticket: newTicket,
      newAvailablePoints: Math.max(0, user.earnedPoints - user.spentPoints)
    });
  }

  // 3. Info Tiket (Pengunjung & Admin)
  // GET /api/ticket?token=JLJ-XXXX
  if (pathname === '/api/ticket' && req.method === 'GET') {
    const token = (parsedUrl.searchParams.get('token') || '').trim().toUpperCase();
    const ticket = db.tickets[token];
    if (!ticket) {
      return sendJSON(res, { error: `Tiket dengan kode "${token}" tidak ditemukan di database!` }, 404);
    }
    return sendJSON(res, { success: true, ticket });
  }

  // --- D. ADMIN CONTROL & INVENTORY MANAGEMENT ---

  // 4. Admin: Verifikasi & Serahkan Hadiah
  // POST /api/admin/verify
  if (pathname === '/api/admin/verify' && req.method === 'POST') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin yang sah' }, 401);
    }

    const body = await parseRequestBody(req);
    const token = (body.token || '').trim().toUpperCase();

    const ticket = db.tickets[token];
    if (!ticket) {
      return sendJSON(res, { error: `Tiket "${token}" tidak ditemukan!` }, 404);
    }

    if (ticket.status === 'DISBURSED') {
      return sendJSON(res, {
        error: `PERINGATAN: Hadiah untuk tiket ini SUDAH PERNAH DISERAHKAN pada ${ticket.disbursedAt}! Jangan diserahkan lagi.`,
        alreadyDisbursed: true,
        ticket
      }, 400);
    }

    ticket.status = 'DISBURSED';
    ticket.disbursedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    saveDB();

    console.log(`[VERIFIKASI SUKSES] Hadiah diserahkan untuk ${ticket.userName} (${ticket.rewardName}, Kode: ${token})`);

    return sendJSON(res, {
      success: true,
      ticket,
      message: `Hadiah fisik "${ticket.rewardName}" telah diverifikasi & resmi diserahkan kepada ${ticket.userName}!`
    });
  }

  // 5. Admin Stats & Inventory List
  // GET /api/admin/stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin yang sah' }, 401);
    }

    const allTickets = Object.values(db.tickets);
    const disbursed = allTickets.filter(t => t.status === 'DISBURSED');
    return sendJSON(res, {
      success: true,
      stats: {
        totalTickets: allTickets.length,
        totalDisbursed: disbursed.length,
        totalVisitors: Object.keys(db.users).length,
        totalMissions: (db.missions || []).length
      },
      tickets: allTickets,
      rewards: db.rewards,
      missions: db.missions || []
    });
  }

  // 6. Admin: Update Stok Hadiah Delta (+/- 1)
  // POST /api/admin/stock
  if (pathname === '/api/admin/stock' && req.method === 'POST') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin yang sah' }, 401);
    }

    const body = await parseRequestBody(req);
    const { rewardId, delta } = body;
    const rw = db.rewards.find(r => r.id === rewardId);
    if (rw) {
      rw.stock = Math.max(0, rw.stock + (delta || 0));
      saveDB();
      return sendJSON(res, { success: true, reward: rw });
    }
    return sendJSON(res, { error: 'Hadiah tidak ditemukan' }, 404);
  }

  // 7. Admin: Update Stok Hadiah NOMINAL LANGSUNG (Bisa Diketik Angkanya Bebas)
  // POST /api/admin/reward/set-stock
  if (pathname === '/api/admin/reward/set-stock' && req.method === 'POST') {
    if (!checkAdminAuth(req, parsedUrl)) {
      return sendJSON(res, { error: 'Akses ditolak: Membutuhkan PIN Admin yang sah' }, 401);
    }

    const body = await parseRequestBody(req);
    const { rewardId, stock } = body;
    const rw = db.rewards.find(r => r.id === rewardId);
    if (rw) {
      rw.stock = Math.max(0, parseInt(stock) || 0);
      saveDB();
      console.log(`[ADMIN STOCK] Stok ${rw.name} diubah menjadi: ${rw.stock}`);
      return sendJSON(res, { success: true, reward: rw, message: `Stok "${rw.name}" berhasil diatur ke ${rw.stock}.` });
    }
    return sendJSON(res, { error: 'Hadiah tidak ditemukan' }, 404);
  }

  // 8. Info Host & IP WiFi Jaringan
  // GET /api/info
  if (pathname === '/api/info' && req.method === 'GET') {
    const reachable = getReachableIPs();
    const primaryIP = reachable.length > 0 ? reachable[0].ip : 'localhost';

    return sendJSON(res, {
      success: true,
      primaryIP,
      port: PORT,
      interfaces: reachable,
      scannerUrl: `http://${primaryIP}:${PORT}/scanner.html`,
      visitorUrl: `http://${primaryIP}:${PORT}`
    });
  }

  // ================= STATIC FILES SERVING (SECURED AGAINST PATH TRAVERSAL & DATA LEAKS) =================
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';

  // Blokir upaya traversal eksplisit di raw URL
  if (req.url.includes('..') || req.url.includes('\\')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden - Akses Ditolak');
    return;
  }

  // Sanitasi & verifikasi letak file
  const decodedPath = decodeURIComponent(reqUrl.split('?')[0]);
  const safePath = path.normalize(path.join(BASE_DIR, '.' + decodedPath));

  // Cegah directory traversal di luar BASE_DIR
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden - Akses Ditolak');
    return;
  }

  // Blokir akses ke file sensitif server & data internal
  const relPath = path.relative(BASE_DIR, safePath).replace(/\\/g, '/').toLowerCase();
  
  // PROTEKSI AKSES HALAMAN PANITIA (SERVER-SIDE GATEKEEPER)
  // Memblokir publik mengakses /admin.html, /scanner.html, /admin-print-qr.html jika bukan panitia berizin
  const ADMIN_PAGES = ['admin.html', 'scanner.html', 'admin-print-qr.html'];
  const requestedFile = path.basename(safePath).toLowerCase();

  if (ADMIN_PAGES.includes(requestedFile)) {
    const cookieHeader = req.headers.cookie || '';
    const cookieToken = (cookieHeader.match(/jelajah_admin_token=([^;]+)/) || [])[1];
    const queryKey = parsedUrl.searchParams.get('key');
    const hasValidCookie = cookieToken && adminSessions.has(cookieToken);
    const hasValidKey = queryKey === ADMIN_KEY;

    if (!hasValidCookie && !hasValidKey) {
      // Return 404 Not Found seolah halaman ini TIDAK ADA di server
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 Not Found — JELAJAH</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8F6F0; color: #153726; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .box { background: #FFF; padding: 36px; border-radius: 16px; border: 2px solid #E0DCD3; max-width: 420px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
            h1 { font-size: 48px; margin: 0 0 10px 0; color: #8C442A; }
            p { font-size: 14px; color: #57655E; line-height: 1.5; margin-bottom: 20px; }
            a { background: #0A8754; color: #FFF; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>404</h1>
            <h3>Halaman Tidak Ditemukan</h3>
            <p>Halaman yang Anda tuju tidak tersedia atau Anda tidak memiliki akses panitia.</p>
            <a href="/">Kembali ke Beranda</a>
          </div>
        </body>
        </html>
      `);
      return;
    }
  }

  if (
    relPath === 'server.js' ||
    relPath === 'package.json' ||
    relPath === 'package-lock.json' ||
    relPath.startsWith('data/') ||
    relPath.startsWith('.git') ||
    relPath.startsWith('scratch/') ||
    path.basename(relPath).startsWith('.')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden - File Sistem Dilindungi');
    return;
  }

  const ext = path.extname(safePath).toLowerCase();

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Halaman JELAJAH tidak ditemukan');
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  const reachable = getReachableIPs();
  const primaryIP = reachable.length > 0 ? reachable[0].ip : 'localhost';

  console.log('\n================================================================');
  console.log('🚀 JELAJAH (jelajah.tech) — Server Backend & Sync Aktif!');
  console.log('================================================================');
  console.log(`💻 Buka di Laptop (Browser ini) : http://localhost:${PORT}`);
  console.log(`⚙️ Panel Admin & Dashboard     : http://localhost:${PORT}/admin.html`);
  console.log(`📱 SCANNER KHUSUS HP PANITIA    : http://${primaryIP}:${PORT}/scanner.html`);
  console.log('----------------------------------------------------------------');
  console.log(`📱 BUKA DI BROWSER HP (WIFI KAMPUS / EXPO):`);
  if (reachable.length > 0) {
    reachable.forEach(r => {
      console.log(`   👉 http://${r.ip}:${PORT}  [Adapter: ${r.interface}]`);
    });
  } else {
    console.log(`   👉 http://localhost:${PORT}`);
  }
  console.log('----------------------------------------------------------------');
  console.log('💡 TIPS KONEKSI HP:');
  console.log('1. Pastikan HP dan Laptop terhubung ke WiFi / Hotspot yang SAMA.');
  console.log(`2. Di browser HP (Chrome/Safari), ketik: http://${primaryIP}:${PORT}`);
  console.log('3. Atau scan QR code panduan yang tampil di layar Admin Laptop!');
  console.log('================================================================\n');
});

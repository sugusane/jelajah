# Panduan Deployment JELAJAH ke AWS EC2 (t3.small) & Domain jelajah.tech

Panduan praktis ini dirancang untuk memanfaatkan **kredit AWS \$90 USD** secara maksimal agar server dapat berjalan lancar selama berbulan-bulan tanpa biaya tambahan.

---

## 1. Analisis Efisiensi Biaya (Kredit AWS \$90 USD)

* **Tipe Instance:** **`t3.small`** (2 vCPU, 2 GB RAM)
  - Biaya di Region Singapore (`ap-southeast-1`): $\approx \$0.026$ / jam $\approx \$18.7$ / bulan.
  - Dengan kredit **\$90 USD**, instance ini sanggup menyala aktif **4 hingga 5 bulan berturut-turut**.
  - Sangat kuat menampung ribuan pengunjung expo bersamaan dengan arsitektur Nginx + Node.js.
  - *(Opsi alternatif super hemat: `t4g.small` berbasis ARM seharga $\approx \$12$/bulan, bertahan **7+ bulan**).*
* **Storage EBS:** 20 GB gp3 ($\approx \$1.6$ / bulan).

---

## 2. Langkah 1 — Launch AWS EC2 Instance

1. Buka [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Pilih Region terdekat dengan Indonesia: **Singapore (`ap-southeast-1`)** atau **Jakarta (`ap-southeast-3`)**.
3. Klik tombol **Launch instance**.
4. Isi form berikut:
   * **Name:** `jelajah-expo-server`
   * **Application and OS Images:** Pilih **Ubuntu**, lalu pilih versi **Ubuntu Server 24.04 LTS (HVM)**.
   * **Architecture:** `64-bit (x86)`
   * **Instance type:** Pilih **`t3.small`** (2 vCPU, 2 GiB Memory).
   * **Key pair (login):** Buat key pair baru (misal `jelajah-key.pem`), download dan simpan baik-baik di laptop Anda.
   * **Network settings (Security Group):**
     - Centang **Allow SSH traffic from anywhere (0.0.0.0/0)**
     - Centang **Allow HTTP traffic from the internet** (Port 80)
     - Centang **Allow HTTPS traffic from the internet** (Port 443)
   * **Configure storage:** Atur menjadi **20 GiB gp3**.
5. Klik **Launch instance**.
6. Salin **Public IPv4 address** instance Anda (misal: `13.250.xx.xx`).

---

## 3. Langkah 2 — Hubungkan Domain `jelajah.tech` (Setting DNS)

Masuk ke dashboard tempat Anda membeli domain `jelajah.tech` (misal: Namecheap, Niagahoster, Rumahweb, Cloudflare, dll):

Buka menu **DNS Management / Zone Editor**, lalu tambahkan 2 buah **A Record**:
1. **Host:** `@` (atau kosong) $\rightarrow$ **Value / Points to:** `Public IPv4 EC2 Anda` (contoh: `13.250.xx.xx`) | TTL: Auto / 300 detik
2. **Host:** `www` $\rightarrow$ **Value / Points to:** `Public IPv4 EC2 Anda` (contoh: `13.250.xx.xx`) | TTL: Auto / 300 detik

> *Catatan: Propagasi DNS biasanya memakan waktu 5–15 menit.*

---

## 4. Langkah 3 — SSH ke Server & Upload Kode JELAJAH

Buka terminal di laptop Anda (Git Bash / PowerShell):
```bash
# Berikan izin ke file key jika di Linux/Mac (di Windows lewati chmod)
chmod 400 jelajah-key.pem

# Masuk ke server EC2
ssh -i "jelajah-key.pem" ubuntu@<PUBLIC_IP_EC2_ANDA>
```

Setelah masuk ke terminal server Ubuntu EC2:
```bash
# Clone repository atau buat folder projek
mkdir -p ~/jelajah
cd ~/jelajah

# Upload file projek (atau git clone jika ditaruh di GitHub)
```
*(Tips paling praktis jika menggunakan Git: Push kodingan ini ke GitHub privat/publik, lalu jalankan `git clone <URL_REPO> ~/jelajah && cd ~/jelajah`)*.

---

## 5. Langkah 4 — Jalankan Script Otomatis Setup

Cukup jalankan satu perintah:
```bash
cd ~/jelajah
bash deploy/setup-aws-ec2.sh
```

Script ini akan otomatis menginstall Node.js 20, PM2, Nginx, mengkonfigurasi reverse proxy, dan menjalankan JELAJAH di background 24/7.

---

## 6. Langkah 5 — Aktifkan SSL HTTPS Gratis (Let's Encrypt)

Setelah domain `jelajah.tech` terhubung ke IP EC2:
```bash
sudo certbot --nginx -d jelajah.tech -d www.jelajah.tech
```
* Masukkan email Anda untuk notifikasi sertifikat.
* Setujui Term of Service (`Y`).
* Certbot akan otomatis memperbarui konfigurasi Nginx menjadi HTTPS gembok hijau resmi dan mengatur auto-renewal tiap 3 bulan.

---

## 7. Pemantauan & Perawatan Sehari-hari

* **Melihat status server:** `pm2 status`
* **Melihat log real-time:** `pm2 logs jelajah`
* **Restart server:** `pm2 restart jelajah`
* **Cek pemakaian CPU/RAM:** `htop` atau `pm2 monit`

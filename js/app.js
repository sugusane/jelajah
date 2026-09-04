// JELAJAH (jelajah.tech) — Core Application Engine
// Gamifikasi Expo PMW UPN Veteran Jawa Timur

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER (Tanpa File Eksternal) ---
  class SoundFX {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    playTone(freq, duration = 0.15, type = 'sine', delay = 0) {
      if (!this.enabled) return;
      try {
        this.init();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Fallback silently if audio context is blocked
      }
    }

    success() {
      this.playTone(523.25, 0.1, 'triangle', 0);    // C5
      this.playTone(659.25, 0.1, 'triangle', 0.08); // E5
      this.playTone(783.99, 0.1, 'triangle', 0.16); // G5
      this.playTone(1046.50, 0.25, 'triangle', 0.24); // C6
    }

    click() {
      this.playTone(440, 0.05, 'sine', 0);
    }

    zoom() {
      this.playTone(330, 0.08, 'sine', 0);
      this.playTone(440, 0.08, 'sine', 0.04);
    }

    pinTap() {
      this.playTone(587.33, 0.08, 'sine', 0);
      this.playTone(880, 0.1, 'triangle', 0.05);
    }

    openModal() {
      this.playTone(440, 0.1, 'sine', 0);
      this.playTone(659.25, 0.12, 'triangle', 0.06);
    }

    wrong() {
      this.playTone(220, 0.15, 'sawtooth', 0);
      this.playTone(180, 0.2, 'sawtooth', 0.12);
    }

    reward() {
      this.playTone(440, 0.12, 'triangle', 0);
      this.playTone(554.37, 0.12, 'triangle', 0.1);
      this.playTone(659.25, 0.12, 'triangle', 0.2);
      this.playTone(880, 0.35, 'triangle', 0.3);
    }
  }

  // --- CONFETTI ENGINE (Canvas) ---
  class ConfettiManager {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 60) {
      if (!this.ctx) return;
      const colors = ['#F0A93E', '#2B8C82', '#DE5D4E', '#153726', '#FFA726', '#FFFFFF'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }
      if (!this.animId) this.animate();
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.animate());
      } else {
        this.animId = null;
      }
    }
  }

  // --- STANDARDIZED ISO QR CODE GENERATOR ---
  function renderQRCodeToElement(container, text, size = 154) {
    if (!container) return;
    container.innerHTML = '';
    if (window.QRCode) {
      try {
        new window.QRCode(container, {
          text: text,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
        return;
      } catch (e) {
        console.warn('QRCode generation fallback:', e);
      }
    }
  }

  // --- STATE CONTROLLER ---
  class JelajahApp {
    constructor() {
      this.sound = new SoundFX();
      this.confetti = new ConfettiManager('confettiCanvas');
      this.currentFilter = 'all';
      this.selectedLocation = null;
      this.deviceId = this.loadDeviceId();
      this.unlockedBooths = JSON.parse(localStorage.getItem('jelajah_unlocked_booths') || '{}');
      this.user = this.loadUser();
      
      this.initElements();
      this.initMapControls();
      this.bindEvents();
      this.initAuthEvents();
      this.renderMap();
      this.renderBoothCards();
      this.renderRewards();
      this.renderLeaderboard();
      this.updateUI();
      this.checkUrlParams();
      this.loadDynamicMissions();
      this.syncWithServer();
      setInterval(() => this.syncWithServer(), 3500);
    }

    loadDeviceId() {
      let devId = localStorage.getItem('jelajah_device_id');
      if (!devId) {
        devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('jelajah_device_id', devId);
      }
      return devId;
    }

    async loadDynamicMissions() {
      try {
        const res = await fetch('/api/missions');
        if (res.ok) {
          const data = await res.json();
          if (data.missions && Array.isArray(data.missions) && data.missions.length > 0) {
            window.JELAJAH_DATA.locations = data.missions;
            this.renderMap();
            this.renderBoothCards();
            this.updateUI();
          }
        }
      } catch (e) {
        // Fallback ke window.JELAJAH_DATA default
      }
    }

    async syncWithServer() {
      try {
        const missionPointsMap = {};
        window.JELAJAH_DATA.locations.forEach(l => { missionPointsMap[l.id] = l.points; });
        const res = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.user.id,
            name: this.user.name,
            completedMissions: this.user.completedMissions,
            missionPointsMap,
            deviceId: this.deviceId
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            this.user.earnedPoints = data.user.earnedPoints;
            this.user.spentPoints = data.user.spentPoints;
            this.user.tickets = data.user.tickets || [];
            if (data.user.identifier) this.user.identifier = data.user.identifier;
            this.saveUser();
            this.updateUI();
            this.renderRewards();
          }
          if (data.rewards) {
            window.JELAJAH_DATA.rewards = data.rewards;
          }
          if (data.liveVisitors) {
            const liveEl = document.getElementById('liveVisitorsCount');
            if (liveEl) liveEl.textContent = data.liveVisitors;
          }
        }
      } catch (e) {
        // Mode offline fallback jika fetch gagal
      }
    }

    checkUrlParams() {
      try {
        const params = new URLSearchParams(window.location.search);
        const missionId = params.get('mission') || params.get('scan');
        if (missionId) {
          this.unlockedBooths[missionId] = true;
          localStorage.setItem('jelajah_unlocked_booths', JSON.stringify(this.unlockedBooths));
          const loc = window.JELAJAH_DATA.locations.find(l => l.id === missionId);
          if (loc) {
            this.showToast(`🎉 Check-in di ${loc.name} berhasil! Kuis terbuka.`);
            setTimeout(() => this.openMission(loc), 450);
          }
        }
      } catch (e) {}
    }

    loadUser() {
      const saved = localStorage.getItem('jelajah_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        id: 'user_' + Math.random().toString(36).substr(2, 6),
        name: 'Penjelajah PMW',
        identifier: '',
        completedMissions: [], // Array ID misi
        redeemedRewards: [],   // Array klaim hadiah
        earnedPoints: 0,
        spentPoints: 0
      };
    }

    saveUser() {
      localStorage.setItem('jelajah_user', JSON.stringify(this.user));
    }

    getAvailablePoints() {
      const earned = this.user.completedMissions.reduce((total, id) => {
        const loc = window.JELAJAH_DATA.locations.find(l => l.id === id);
        return total + (loc ? loc.points : 0);
      }, 0);
      return Math.max(0, earned - (this.user.spentPoints || 0));
    }

    initElements() {
      this.elNavPoints = document.getElementById('navPoints');
      this.elProgressFill = document.getElementById('progressFill');
      this.elProgressPct = document.getElementById('progressPct');
      this.elCompletedCount = document.getElementById('completedCount');
      this.elMapPinsLayer = document.getElementById('mapPinsLayer');
      this.elToast = document.getElementById('toastNotice');
      this.elToastText = document.getElementById('toastText');
      this.elMissionModal = document.getElementById('missionModal');
      this.elRewardModal = document.getElementById('rewardModal');
      this.elProfileModal = document.getElementById('profileModal');
      this.elSoundToggle = document.getElementById('soundToggle');
      this.elFilterPills = document.querySelectorAll('.filter-pill');
      this.elNavItems = document.querySelectorAll('.nav-item');
      this.elTabViews = document.querySelectorAll('.tab-view');
    }

    initMapControls() {
      this.mapScale = 1.0;
      this.mapPanX = 0;
      this.mapPanY = 0;
      this.isMapFullscreen = false;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.initialPinchDistance = null;
      this.initialScaleOnPinch = 1.0;

      this.elMapWrapper = document.querySelector('.map-wrapper');
      this.elMapViewport = document.getElementById('mapViewport');
      this.elMapCanvasLayer = document.getElementById('mapCanvasLayer');
      this.elMapZoomBadge = document.getElementById('mapZoomBadge');
      this.elBtnZoomIn = document.getElementById('btnZoomIn');
      this.elBtnZoomOut = document.getElementById('btnZoomOut');
      this.elBtnResetZoom = document.getElementById('btnResetZoom');
      this.elBtnToggleFullscreen = document.getElementById('btnToggleFullscreen');

      if (!this.elMapCanvasLayer || !this.elMapViewport) return;

      // 1. Zoom In Button
      if (this.elBtnZoomIn) {
        this.elBtnZoomIn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.zoom();
          this.mapScale = Math.min(3.5, Math.round((this.mapScale + 0.3) * 10) / 10);
          this.updateMapTransform();
        });
      }

      // 2. Zoom Out Button
      if (this.elBtnZoomOut) {
        this.elBtnZoomOut.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.zoom();
          this.mapScale = Math.max(0.8, Math.round((this.mapScale - 0.3) * 10) / 10);
          this.updateMapTransform();
        });
      }

      // 3. Reset Button
      if (this.elBtnResetZoom) {
        this.elBtnResetZoom.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.click();
          this.mapScale = 1.0;
          this.mapPanX = 0;
          this.mapPanY = 0;
          this.updateMapTransform();
          this.showToast('Tampilan denah peta direset');
        });
      }

      // 4. Fullscreen Toggle Button
      if (this.elBtnToggleFullscreen) {
        this.elBtnToggleFullscreen.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMapFullscreen();
        });
      }

      // ESC key to exit fullscreen
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMapFullscreen) {
          this.toggleMapFullscreen(false);
        }
      });

      // 5. Mouse Drag to Pan
      this.elMapViewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.map-pin') || e.target.closest('.map-toolbar') || e.target.closest('.map-legend-btn')) return;
        this.isDragging = true;
        this.dragStartX = e.clientX - this.mapPanX;
        this.dragStartY = e.clientY - this.mapPanY;
        this.elMapCanvasLayer.classList.add('is-dragging');
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.mapPanX = e.clientX - this.dragStartX;
        this.mapPanY = e.clientY - this.dragStartY;
        this.updateMapTransform(false);
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.elMapCanvasLayer.classList.remove('is-dragging');
        }
      });

      // 6. Mouse Wheel Zoom
      this.elMapViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        this.mapScale = Math.min(3.5, Math.max(0.8, Math.round((this.mapScale + delta) * 100) / 100));
        this.updateMapTransform(false);
      }, { passive: false });

      // 7. Touch Pan & Pinch to Zoom (Mobile Optimized)
      this.elMapViewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('.map-pin') || e.target.closest('.map-toolbar') || e.target.closest('.map-legend-btn')) return;
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX - this.mapPanX;
          this.dragStartY = e.touches[0].clientY - this.mapPanY;
          this.elMapCanvasLayer.classList.add('is-dragging');
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.initialPinchDistance = Math.hypot(dx, dy);
          this.initialScaleOnPinch = this.mapScale;
        }
      }, { passive: true });

      this.elMapViewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && this.initialPinchDistance) {
          e.preventDefault();
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / this.initialPinchDistance;
          this.mapScale = Math.min(3.5, Math.max(0.8, Math.round(this.initialScaleOnPinch * ratio * 100) / 100));
          this.updateMapTransform(false);
        } else if (e.touches.length === 1 && this.isDragging) {
          e.preventDefault();
          this.mapPanX = e.touches[0].clientX - this.dragStartX;
          this.mapPanY = e.touches[0].clientY - this.dragStartY;
          this.updateMapTransform(false);
        }
      }, { passive: false });

      this.elMapViewport.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          this.isDragging = false;
          this.initialPinchDistance = null;
          this.elMapCanvasLayer.classList.remove('is-dragging');
        } else if (e.touches.length === 1) {
          this.initialPinchDistance = null;
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX - this.mapPanX;
          this.dragStartY = e.touches[0].clientY - this.mapPanY;
        }
      });
    }

    toggleMapFullscreen(forceState) {
      this.isMapFullscreen = forceState !== undefined ? forceState : !this.isMapFullscreen;
      if (this.elMapWrapper) {
        this.elMapWrapper.classList.toggle('map-fullscreen', this.isMapFullscreen);
      }
      if (this.elBtnToggleFullscreen) {
        this.elBtnToggleFullscreen.textContent = this.isMapFullscreen ? '🗗' : '⛶';
        this.elBtnToggleFullscreen.classList.toggle('active', this.isMapFullscreen);
        this.elBtnToggleFullscreen.title = this.isMapFullscreen ? 'Perkecil Denah (Minimize)' : 'Layar Penuh (Fullscreen)';
      }
      this.sound.click();
      this.showToast(this.isMapFullscreen ? 'Mode Denah Penuh ⛶ (Tekan ESC untuk keluar)' : 'Tampilan Denah Normal');
      this.updateMapTransform();
    }

    updateMapTransform(animate = true) {
      if (!this.elMapCanvasLayer) return;
      this.elMapCanvasLayer.style.transition = animate ? 'transform 0.15s ease-out' : 'none';
      this.elMapCanvasLayer.style.transform = `translate(${this.mapPanX}px, ${this.mapPanY}px) scale(${this.mapScale})`;

      if (this.elMapZoomBadge) {
        const pct = Math.round(this.mapScale * 100);
        this.elMapZoomBadge.textContent = `🔍 ${pct}% · Geser & Cubit/Scroll Zoom${this.isMapFullscreen ? ' · ESC' : ''}`;
      }
    }

    bindEvents() {
      // Sound toggle
      if (this.elSoundToggle) {
        this.elSoundToggle.addEventListener('click', () => {
          this.sound.enabled = !this.sound.enabled;
          this.elSoundToggle.textContent = this.sound.enabled ? '🔊 Suara On' : '🔇 Suara Off';
          this.showToast(this.sound.enabled ? 'Suara diaktifkan' : 'Suara dimatikan');
        });
      }

      // Filter tabs di peta
      this.elFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.sound.click();
          this.elFilterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.currentFilter = pill.dataset.filter;
          this.renderMap();
          this.renderBoothCards();
        });
      });

      // Bottom Navigation Tabs
      this.elNavItems.forEach(item => {
        item.addEventListener('click', () => {
          this.sound.click();
          const targetTab = item.dataset.tab;
          this.elNavItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');

          this.elTabViews.forEach(view => {
            if (view.id === 'tab-' + targetTab) {
              view.classList.add('active');
            } else {
              view.classList.remove('active');
            }
          });

          if (targetTab === 'leaderboard') {
            this.renderLeaderboard();
          } else if (targetTab === 'rewards') {
            this.renderRewards();
          }
        });
      });

      // Close modal on click overlay
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
          }
        });
      });

      document.querySelectorAll('.sheet-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.sound.click();
          btn.closest('.modal-overlay').classList.remove('active');
        });
      });

      // User profile button
      const userBtn = document.getElementById('userProfileBtn');
      if (userBtn) {
        userBtn.addEventListener('click', () => {
          this.sound.click();
          this.openProfileModal();
        });
      }

      // Secret Admin Access (Tap logo 5x atau Ctrl+Shift+A)
      const brandLogo = document.getElementById('brandMascotBadge');
      const adminModal = document.getElementById('adminSecretModal');
      const pinInput = document.getElementById('adminPinInput');
      const btnVerifyPin = document.getElementById('btnVerifyAdminPin');
      const pinSection = document.getElementById('adminPinSection');
      const linksSection = document.getElementById('adminLinksSection');

      let tapCount = 0;
      let tapTimer = null;

      const openAdminSecret = () => {
        if (!adminModal) return;
        this.sound.openModal();
        if (pinInput) pinInput.value = '';
        if (pinSection) pinSection.style.display = 'block';
        if (linksSection) linksSection.style.display = 'none';
        adminModal.classList.add('active');
        if (pinInput) setTimeout(() => pinInput.focus(), 250);
      };

      if (brandLogo) {
        brandLogo.addEventListener('click', () => {
          tapCount++;
          clearTimeout(tapTimer);
          tapTimer = setTimeout(() => { tapCount = 0; }, 2500);
          if (tapCount >= 5) {
            tapCount = 0;
            openAdminSecret();
          }
        });
      }

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          openAdminSecret();
        }
      });

      if (btnVerifyPin) {
        btnVerifyPin.addEventListener('click', async () => {
          const pin = (pinInput ? pinInput.value.trim() : '');
          try {
            const res = await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pin })
            });
            if (res.ok) {
              this.sound.success();
              if (pinSection) pinSection.style.display = 'none';
              if (linksSection) linksSection.style.display = 'block';
            } else {
              this.sound.wrong();
              this.showToast('PIN Admin salah! Akses ditolak.');
              if (pinInput) pinInput.value = '';
            }
          } catch(err) {
            if (pin === 'jelajah1945' || pin === '1945') {
              this.sound.success();
              if (pinSection) pinSection.style.display = 'none';
              if (linksSection) linksSection.style.display = 'block';
            }
          }
        });
      }

      if (pinInput) {
        pinInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') btnVerifyPin.click();
        });
      }
    }

    initAuthEvents() {
      const modal = document.getElementById('authModal');
      if (!modal) return;

      const tabBtnReg = document.getElementById('authTabBtnRegister');
      const tabBtnLogin = document.getElementById('authTabBtnLogin');
      const formReg = document.getElementById('formRegister');
      const formLogin = document.getElementById('formLogin');

      if (tabBtnReg && tabBtnLogin) {
        tabBtnReg.addEventListener('click', () => {
          tabBtnReg.style.background = 'var(--forest)';
          tabBtnReg.style.color = '#FFF';
          tabBtnLogin.style.background = 'transparent';
          tabBtnLogin.style.color = 'var(--forest)';
          if (formReg) formReg.style.display = 'block';
          if (formLogin) formLogin.style.display = 'none';
        });

        tabBtnLogin.addEventListener('click', () => {
          tabBtnLogin.style.background = 'var(--forest)';
          tabBtnLogin.style.color = '#FFF';
          tabBtnReg.style.background = 'transparent';
          tabBtnReg.style.color = 'var(--forest)';
          if (formLogin) formLogin.style.display = 'block';
          if (formReg) formReg.style.display = 'none';
        });
      }

      if (formReg) {
        formReg.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('regName').value.trim();
          const identifier = document.getElementById('regIdentifier').value.trim();
          const password = document.getElementById('regPassword').value;

          try {
            const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                identifier,
                password,
                deviceId: this.deviceId
              })
            });
            const data = await res.json();
            if (res.ok && data.user) {
              this.user.id = data.user.id;
              this.user.name = data.user.name;
              this.user.identifier = data.user.identifier;
              this.saveUser();
              this.sound.success();
              this.showToast('Akun berhasil didaftarkan! Selamat menjelajah.');
              modal.classList.remove('active');
              this.updateUI();
              this.syncWithServer();

              if (this._pendingClaimReward) {
                const rw = this._pendingClaimReward;
                this._pendingClaimReward = null;
                this.requestClaimReward(rw);
              }
            } else {
              this.sound.wrong();
              this.showToast(data.error || 'Gagal mendaftar');
            }
          } catch(err) {
            this.showToast('Gagal menghubungi server');
          }
        });
      }

      if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
          e.preventDefault();
          const identifier = document.getElementById('loginIdentifier').value.trim();
          const password = document.getElementById('loginPassword').value;

          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier,
                password,
                deviceId: this.deviceId
              })
            });
            const data = await res.json();
            if (res.ok && data.user) {
              this.user.id = data.user.id;
              this.user.name = data.user.name;
              this.user.identifier = data.user.identifier;
              this.user.completedMissions = data.user.completedMissions || this.user.completedMissions;
              this.user.earnedPoints = data.user.earnedPoints;
              this.user.spentPoints = data.user.spentPoints;
              this.user.tickets = data.user.tickets || [];
              this.saveUser();
              this.sound.success();
              this.showToast(data.message || 'Login berhasil!');
              modal.classList.remove('active');
              this.updateUI();
              this.syncWithServer();

              if (this._pendingClaimReward) {
                const rw = this._pendingClaimReward;
                this._pendingClaimReward = null;
                this.requestClaimReward(rw);
              }
            } else {
              this.sound.wrong();
              this.showToast(data.error || 'Identitas atau password salah');
            }
          } catch(err) {
            this.showToast('Gagal menghubungi server');
          }
        });
      }
    }

    openAuthModal(pendingReward = null) {
      this._pendingClaimReward = pendingReward;
      const modal = document.getElementById('authModal');
      if (modal) {
        this.sound.openModal();
        modal.classList.add('active');
      }
    }

    renderMap() {
      if (!this.elMapPinsLayer) return;
      this.elMapPinsLayer.innerHTML = '';

      const locations = window.JELAJAH_DATA.locations;
      const filtered = locations.filter(loc => {
        if (this.currentFilter === 'all') return true;
        return loc.category === this.currentFilter;
      });

      filtered.forEach(loc => {
        const isDone = this.user.completedMissions.includes(loc.id);
        const isQuick = !!loc.isQuickRoute;
        const pin = document.createElement('div');
        pin.className = `map-pin ${isDone ? 'done' : 'todo'} ${loc.category} ${isQuick ? 'quick-target' : ''}`;
        pin.style.left = `${loc.coords.x}%`;
        pin.style.top = `${loc.coords.y}%`;
        pin.dataset.id = loc.id;

        pin.innerHTML = `
          <div class="pin-bubble ${isQuick && !isDone ? 'quick-route' : ''}">
            ${isDone ? '✓' : (isQuick ? '⚡' : loc.shortLabel)}
          </div>
          <div class="pin-label-tag">
            ${isQuick ? '⚡ ' : ''}${loc.shortLabel}
          </div>
        `;

        pin.addEventListener('click', () => {
          this.sound.pinTap();
          this.openMission(loc);
        });

        this.elMapPinsLayer.appendChild(pin);
      });

      // Update badge counts on filter pills
      const counts = {
        all: locations.length,
        makanan: locations.filter(l => l.category === 'makanan').length,
        sponsor: locations.filter(l => l.category === 'sponsor').length,
        special: locations.filter(l => l.category === 'special').length
      };

      this.elFilterPills.forEach(pill => {
        const type = pill.dataset.filter;
        const countSpan = pill.querySelector('.filter-count');
        if (countSpan && counts[type] !== undefined) {
          countSpan.textContent = counts[type];
        }
      });
    }

    renderBoothCards() {
      const container = document.getElementById('boothCardsGrid');
      if (!container) return;
      container.innerHTML = '';

      const locations = window.JELAJAH_DATA.locations;
      const filtered = locations.filter(loc => {
        if (this.currentFilter === 'all') return true;
        return loc.category === this.currentFilter;
      });

      filtered.forEach(loc => {
        const isDone = this.user.completedMissions.includes(loc.id);
        const isQuick = !!loc.isQuickRoute;

        const card = document.createElement('div');
        card.className = `booth-card ${isDone ? 'is-done' : ''} ${isQuick ? 'is-quick' : ''}`;
        card.dataset.id = loc.id;

        let catIcon = '📍';
        let catLabel = 'Spot Khusus';
        if (loc.category === 'makanan') { catIcon = '🍔'; catLabel = 'Kuliner'; }
        else if (loc.category === 'sponsor') { catIcon = '🏢'; catLabel = 'Sponsor'; }

        const isSpecialGate = (loc.category === 'special');
        const isUnlocked = isSpecialGate || !!this.unlockedBooths[loc.id];
        let actionBtnText = '🔒 Datangi Meja';
        if (isDone) actionBtnText = 'Lihat Status ✓';
        else if (isUnlocked) actionBtnText = 'Mulai Kuis 📝';
        else if (isQuick) actionBtnText = '⚡ Kilat (Scan)';

        card.innerHTML = `
          <div class="booth-card-top">
            <div class="booth-card-meta">
              <span class="booth-num-badge">${loc.shortLabel}</span>
              <span class="booth-zone-tag">${catIcon} ${catLabel} · ${loc.zone}</span>
            </div>
            <div class="booth-points-badge">
              ⭐ +${loc.points} pts
            </div>
          </div>
          <div>
            <h4 class="booth-card-title">${loc.name}</h4>
            <p class="booth-card-desc">${loc.desc}</p>
          </div>
          <div class="booth-card-footer">
            <span class="booth-status-text ${isDone ? 'done' : (isUnlocked ? 'quick' : 'todo')}">
              ${isDone ? '✅ Misi Selesai' : (isUnlocked ? '🔓 Kuis Siap' : '🔒 Belum Di-scan')}
            </span>
            <button class="btn-booth-action" style="${!isDone && !isUnlocked ? 'background:#EDE8DF; color:#6E5624;' : ''}">
              ${actionBtnText}
            </button>
          </div>
        `;

        card.addEventListener('click', () => {
          this.sound.pinTap();
          this.openMission(loc);
        });

        container.appendChild(card);
      });
    }

    openMission(loc) {
      this.selectedLocation = loc;
      this.sound.openModal();
      const isDone = this.user.completedMissions.includes(loc.id);

      const titleEl = document.getElementById('missionTitle');
      const zoneEl = document.getElementById('missionZone');
      const ptsEl = document.getElementById('missionPoints');
      const descEl = document.getElementById('missionDesc');
      const taskBoxEl = document.getElementById('missionTaskBox');

      if (titleEl) titleEl.textContent = loc.name;
      if (zoneEl) zoneEl.textContent = loc.zone;
      if (ptsEl) ptsEl.textContent = `+${loc.points} Poin`;
      if (descEl) descEl.textContent = loc.desc;

      if (isDone) {
        taskBoxEl.innerHTML = `
          <div style="text-align:center; padding: 20px 10px;">
            <div style="font-size:42px; margin-bottom:8px;">🎉</div>
            <h4 style="font-family:'Fredoka'; font-size:18px; color:var(--teal);">Misi Ini Telah Selesai!</h4>
            <p style="font-size:13px; color:var(--ink-muted); margin-top:6px;">
              Kamu sudah mengantongi <strong>${loc.points} poin</strong> dari titik ini. Jelajahi titik lainnya di denah!
            </p>
          </div>
        `;
      } else {
        // Kuis HANYA terbuka jika pengunjung datang langsung ke booth dan scan QR atau ketik kode
        const isSpecialGate = (loc.category === 'special');
        const isUnlocked = isSpecialGate || !!this.unlockedBooths[loc.id];

        if (isUnlocked) {
          this.renderTaskContent(loc, taskBoxEl);
        } else {
          taskBoxEl.innerHTML = `
            <div style="background:#FFF9E6; border:2px dashed #E0A020; border-radius:14px; padding:18px; text-align:center;">
              <div style="font-size:36px; margin-bottom:6px;">🔒</div>
              <h4 style="font-family:'Fredoka'; font-size:18px; color:var(--forest); margin-bottom:6px;">
                Tantangan Terkunci!
              </h4>
              <p style="font-size:12.5px; color:#5D4412; line-height:1.5; margin-bottom:14px;">
                Kamu harus mendatangi <strong>${loc.name}</strong> di area expo, lalu <strong>scan QR Code di meja booth</strong> menggunakan kamera HP-mu untuk membuka kuis &amp; klaim poin!
              </p>

              <!-- ALTERNATIF KODE RAHASIA TENANT -->
              <div style="background:#FFF; border:1px solid #D6CDBF; border-radius:12px; padding:12px; text-align:left;">
                <label style="font-size:11.5px; font-weight:700; color:var(--forest); display:block; margin-bottom:4px;">
                  ATAU KETIK KODE RAHASIA BOOTH:
                </label>
                <p style="font-size:11px; color:var(--ink-muted); margin-bottom:8px;">
                  (Minta kode rahasia ke penjaga booth jika kamera HP-mu tidak bisa scan QR)
                </p>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="inputSecretCodeGate" class="code-input" placeholder="Contoh: JLJ-..." style="text-transform:uppercase; font-size:14px;" maxlength="20" />
                  <button type="button" id="btnSubmitSecretCodeGate" class="btn-submit-action" style="padding:0 16px; width:auto;">Buka Kuis</button>
                </div>
              </div>
            </div>
          `;

          const btnUnlock = document.getElementById('btnSubmitSecretCodeGate');
          const inputCode = document.getElementById('inputSecretCodeGate');
          if (btnUnlock && inputCode) {
            const handleUnlock = () => {
              const code = inputCode.value.trim().toUpperCase();
              const expectedCode = (loc.secretCode || ('JLJ-' + loc.id.toUpperCase().replace('BOOTH-', ''))).toUpperCase();
              if (code && (code === expectedCode || code === loc.id.toUpperCase())) {
                this.sound.success();
                this.unlockedBooths[loc.id] = true;
                localStorage.setItem('jelajah_unlocked_booths', JSON.stringify(this.unlockedBooths));
                this.showToast('✅ Berhasil check-in di booth! Kuis terbuka.');
                this.renderTaskContent(loc, taskBoxEl);
                this.renderBoothCards();
              } else {
                this.sound.wrong();
                this.showToast('Kode rahasia salah! Tanyakan langsung ke penjaga booth.');
              }
            };
            btnUnlock.addEventListener('click', handleUnlock);
            inputCode.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') handleUnlock();
            });
          }
        }
      }

      this.elMissionModal.classList.add('active');
    }

    renderTaskContent(loc, container) {
      const task = loc.task;

      if (task.type === 'instant') {
        container.innerHTML = `
          <p style="font-size:13px; margin-bottom:12px; font-weight:500;">${task.prompt}</p>
          <button class="btn-submit-action" id="btnInstantSubmit">${task.btnText}</button>
        `;
        document.getElementById('btnInstantSubmit').addEventListener('click', () => {
          this.completeMission(loc);
        });
      } else if (task.type === 'quiz') {
        let optionsHtml = '';
        task.options.forEach((opt, idx) => {
          optionsHtml += `
            <button class="quiz-opt-btn" data-index="${idx}">
              <span style="font-weight:700; width:20px; font-family:'Fredoka';">${String.fromCharCode(65 + idx)}.</span>
              <span>${opt}</span>
            </button>
          `;
        });

        container.innerHTML = `
          <p style="font-size:13.5px; font-weight:600; color:var(--forest); margin-bottom:10px;">
            ❓ Pertanyaan:
          </p>
          <p style="font-size:13px; margin-bottom:12px;">${task.question}</p>
          <div class="quiz-options">
            ${optionsHtml}
          </div>
        `;

        const buttons = container.querySelectorAll('.quiz-opt-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const chosen = parseInt(btn.dataset.index);
            if (chosen === task.answerIndex) {
              btn.classList.add('correct');
              this.sound.success();
              setTimeout(() => {
                this.completeMission(loc);
              }, 400);
            } else {
              btn.classList.add('wrong');
              this.sound.wrong();
              this.showToast('Jawaban kurang tepat, coba lagi ya! 🤔');
              setTimeout(() => {
                btn.classList.remove('wrong');
              }, 800);
            }
          });
        });
      } else if (task.type === 'secret_code') {
        container.innerHTML = `
          <p style="font-size:13px; font-weight:600; color:var(--forest);">
            🔑 Petunjuk Kode Rahasia:
          </p>
          <p style="font-size:12.5px; color:var(--ink-muted); margin-top:4px;">
            ${task.hint}
          </p>
          <div class="code-input-group">
            <input type="text" class="code-input" id="secretCodeInput" placeholder="${task.placeholder || 'Ketik kode...'}" maxlength="15" autocomplete="off" />
          </div>
          <button class="btn-submit-action" id="btnCodeSubmit">Verifikasi Kode</button>
        `;

        const input = document.getElementById('secretCodeInput');
        const submitBtn = document.getElementById('btnCodeSubmit');

        const verify = () => {
          const val = input.value.trim().toUpperCase();
          if (!val) {
            this.showToast('Silakan masukkan kode terlebih dahulu!');
            return;
          }
          if (val === loc.secretCode.toUpperCase()) {
            this.sound.success();
            this.completeMission(loc);
          } else {
            this.sound.wrong();
            this.showToast('Kode salah! Coba tanyakan ke penjaga booth.');
            input.classList.add('wrong');
            setTimeout(() => input.classList.remove('wrong'), 600);
          }
        };

        submitBtn.addEventListener('click', verify);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') verify();
        });
      } else if (task.type === 'photo') {
        container.innerHTML = `
          <p style="font-size:13px; font-weight:500; margin-bottom:10px;">${task.prompt}</p>
          <div class="photo-upload-area" id="photoUploadTrigger">
            <div style="font-size:32px; margin-bottom:6px;">📸</div>
            <p style="font-size:13px; font-weight:600; color:var(--forest);">${task.btnText}</p>
            <p style="font-size:11px; color:var(--ink-muted); margin-top:3px;">Format foto apa pun (Kamera HP / Galeri)</p>
            <input type="file" id="photoFileInput" accept="image/*" style="display:none;" />
          </div>
          <div class="photo-preview-box" id="photoPreviewBox">
            <img id="photoPreviewImg" src="" alt="Preview Misi Foto" />
            <div style="position:absolute; bottom:8px; right:8px; background:rgba(21,55,38,0.85); color:#F0A93E; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; font-family:'Fredoka';">
              JELAJAH EXPO 2026 ✓
            </div>
          </div>
          <button class="btn-submit-action" id="btnPhotoSubmit" style="display:none;">Kirim Bukti Foto (+${loc.points} Poin)</button>
        `;

        const trigger = document.getElementById('photoUploadTrigger');
        const fileInput = document.getElementById('photoFileInput');
        const previewBox = document.getElementById('photoPreviewBox');
        const previewImg = document.getElementById('photoPreviewImg');
        const submitBtn = document.getElementById('btnPhotoSubmit');

        trigger.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
              previewImg.src = re.target.result;
              previewBox.style.display = 'block';
              trigger.style.display = 'none';
              submitBtn.style.display = 'block';
              this.sound.click();
            };
            reader.readAsDataURL(file);
          }
        });

        submitBtn.addEventListener('click', () => {
          this.sound.success();
          this.completeMission(loc);
        });
      }
    }

    completeMission(loc) {
      if (!this.user.completedMissions.includes(loc.id)) {
        this.user.completedMissions.push(loc.id);
        this.user.earnedPoints += loc.points;
        this.saveUser();
      }

      this.confetti.burst();
      this.sound.success();
      this.showToast(`+${loc.points} Poin! Misi ${loc.shortLabel} Selesai 🎉`);
      
      this.updateUI();
      this.renderMap();
      this.renderBoothCards();
      this.renderRewards();

      // Bounce badge animasi
      const pill = document.querySelector('.points-pill');
      if (pill) {
        pill.classList.add('bounce');
        setTimeout(() => pill.classList.remove('bounce'), 400);
      }

      // Close modal after short delay
      setTimeout(() => {
        this.elMissionModal.classList.remove('active');
      }, 700);
    }

    renderRewards() {
      const container = document.getElementById('rewardCardsGrid');
      if (!container) return;
      container.innerHTML = '';

      const currentPoints = this.getAvailablePoints();
      const rewards = window.JELAJAH_DATA.rewards;
      const userTickets = this.user.tickets || [];

      rewards.forEach(rw => {
        const existingTicket = userTickets.find(t => t.rewardId === rw.id);
        const canAfford = currentPoints >= rw.cost && rw.stock > 0;
        
        let btnText = 'Tukar Hadiah';
        let btnDisabled = false;
        let btnStyle = '';

        if (existingTicket) {
          if (existingTicket.status === 'DISBURSED') {
            btnText = 'Sudah Diambil (1x) ✓';
            btnDisabled = true;
            btnStyle = 'background:#CFD8DC; color:#455A64; box-shadow:none; cursor:not-allowed;';
          } else {
            btnText = 'Lihat Tiket Klaim 🎫';
            btnDisabled = false;
            btnStyle = 'background:var(--forest); color:#FFF; box-shadow:0 2px 0 var(--forest-deep);';
          }
        } else {
          if (rw.stock <= 0) {
            btnText = 'Stok Habis';
            btnDisabled = true;
          } else if (!canAfford) {
            btnText = `Kurang ${rw.cost - currentPoints} pts`;
            btnDisabled = true;
          }
        }

        const item = document.createElement('div');
        item.className = 'reward-item';
        item.innerHTML = `
          <div class="reward-item-icon">${rw.icon || '🎁'}</div>
          <div class="reward-item-content">
            <div class="reward-item-top">
              <div>
                <h4 class="reward-item-title">${rw.name}</h4>
                <span class="reward-sponsor-tag">Sponsor: ${rw.sponsor}</span>
              </div>
              <span class="reward-cost-badge">⭐ ${rw.cost} pts</span>
            </div>
            <p class="reward-item-desc">${rw.desc || 'Tunjukkan tiket QR ke panitia untuk klaim.'}</p>
            <div class="reward-item-actions">
              <span class="reward-stock">Sisa stok: ${rw.stock}</span>
              <button class="btn-redeem" data-id="${rw.id}" style="${btnStyle}" ${btnDisabled ? 'disabled' : ''}>
                ${btnText}
              </button>
            </div>
          </div>
        `;

        const btn = item.querySelector('.btn-redeem');
        if (btn && !btnDisabled) {
          btn.addEventListener('click', () => {
            this.sound.click();
            if (existingTicket) {
              this.showTicketModal(rw, existingTicket);
            } else {
              this.requestClaimReward(rw);
            }
          });
        }

        container.appendChild(item);
      });
    }

    async requestClaimReward(rw) {
      if (!this.user.identifier) {
        this.showToast('Daftarkan akunmu (NIM / WhatsApp) terlebih dahulu agar vouchermu tersimpan!');
        this.openAuthModal(rw);
        return;
      }

      const currentPoints = this.getAvailablePoints();
      if (currentPoints < rw.cost) {
        this.showToast(`Poin tidak cukup! Butuh ${rw.cost} pts, kamu punya ${currentPoints} pts.`);
        return;
      }

      const confirmed = confirm(`Tukar ${rw.cost} poin untuk "${rw.name}"?\n\nSetelah ditukar, kamu akan mendapatkan 1 kode tiket unik untuk ditunjukkan ke panitia di meja expo.`);
      if (!confirmed) return;

      try {
        const res = await fetch('/api/user/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.user.id,
            name: this.user.name,
            completedMissions: this.user.completedMissions,
            rewardId: rw.id,
            deviceId: this.deviceId
          })
        });
        const data = await res.json();

        if (!res.ok) {
          this.showToast(data.error || 'Gagal menukarkan hadiah');
          if (data.ticket) {
            this.showTicketModal(rw, data.ticket);
          }
          return;
        }

        if (data.ticket) {
          if (!this.user.tickets) this.user.tickets = [];
          if (!this.user.tickets.some(t => t.token === data.ticket.token)) {
            this.user.tickets.push(data.ticket);
          }
          if (!data.isExisting) {
            this.user.spentPoints = (this.user.spentPoints || 0) + rw.cost;
          }
          this.saveUser();
          this.sound.reward();
          this.confetti.burst();
          this.updateUI();
          this.renderRewards();
          this.showTicketModal(rw, data.ticket);
        }
      } catch (e) {
        this.showToast('Gagal menghubungi server: ' + e.message);
      }
    }

    showTicketModal(rw, ticket) {
      if (this._ticketPoller) clearInterval(this._ticketPoller);

      const titleEl = document.getElementById('rewardModalTitle');
      const contentEl = document.getElementById('rewardModalContent');

      if (titleEl) titleEl.textContent = 'Klaim Hadiah: ' + (rw.name || ticket.rewardName);

      const renderContent = (t) => {
        if (t.status === 'DISBURSED') {
          contentEl.innerHTML = `
            <div style="background:#E8F5E9; border:2px solid #2E7D32; border-radius:14px; padding:20px; text-align:center; margin-top:12px;">
              <div style="font-size:44px; margin-bottom:8px;">✅</div>
              <h3 style="font-family:'Fredoka'; color:#1B5E20; font-size:20px;">Hadiah Telah Diserahkan</h3>
              <p style="font-size:13px; color:#2E7D32; margin-top:6px; line-height:1.5;">
                Voucher / merchandise ini telah diverifikasi dan diserahkan oleh panitia pada pukul <strong>${t.disbursedAt || 'Tadi'}</strong>.
              </p>
              <div style="margin-top:12px; font-family:'Fredoka', monospace; font-size:18px; color:#1B5E20; letter-spacing:3px; font-weight:700;">
                KODE: ${t.token}
              </div>
              <div style="font-size:11.5px; color:#388E3C; margin-top:8px;">
                Tiket ini sudah hangus dan tidak dapat ditukarkan kembali. Terima kasih telah menjelajah! 🎉
              </div>
            </div>
          `;
        } else {
          contentEl.innerHTML = `
            <div class="claim-pass-ticket">
              <div style="font-size:11px; color:var(--ink-muted); text-transform:uppercase; letter-spacing:1px; font-weight:700;">
                Tiket Penukaran Resmi
              </div>
              <h3 style="font-family:'Fredoka'; color:var(--yupi-green); font-size:19px; margin:6px 0;">
                ${t.rewardName || rw.name}
              </h3>
              <div class="claim-pass-qr" id="claimPassQrBox"></div>
              <div class="claim-token-text">${t.token}</div>
              <p class="claim-hint">
                📍 <strong>Tunjukkan layar ini ke Panitia Meja Expo!</strong>
              </p>
              <p style="font-size:11.5px; color:var(--yupi-red); margin-top:8px;">
                Panitia akan scan QR ini dengan kamera HP atau memeriksa kodenya.
              </p>
              <div style="margin-top:10px; font-size:11px; color:var(--ink-muted); display:flex; align-items:center; justify-content:center; gap:6px;">
                <span class="live-dot" style="display:inline-block; width:8px; height:8px; background:var(--yupi-gold); border-radius:50%; animation:pulse 1.5s infinite;"></span>
                <span>Menunggu validasi panitia...</span>
              </div>
            </div>
          `;
          const qrBox = document.getElementById('claimPassQrBox');
          if (qrBox) {
            renderQRCodeToElement(qrBox, t.token, 154);
          }
        }
      };

      renderContent(ticket);
      this.elRewardModal.classList.add('active');

      // Mulai polling status tiket ke server jika masih PENDING
      if (ticket.status === 'PENDING') {
        this._ticketPoller = setInterval(async () => {
          try {
            const res = await fetch(`/api/ticket?token=${encodeURIComponent(ticket.token)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ticket && data.ticket.status === 'DISBURSED') {
                clearInterval(this._ticketPoller);
                ticket.status = 'DISBURSED';
                ticket.disbursedAt = data.ticket.disbursedAt;
                this.sound.reward();
                this.confetti.burst();
                this.saveUser();
                this.updateUI();
                this.renderRewards();
                renderContent(ticket);
                this.showToast('Hadiah fisik telah diserahkan oleh panitia! 🎉');
              }
            }
          } catch(err) {}
        }, 2500);
      }
    }

    renderLeaderboard() {
      const initial = window.JELAJAH_DATA.initialLeaderboard;
      const myPoints = this.user.earnedPoints;
      const myCompleted = this.user.completedMissions.length;

      // Gabungkan user ke daftar leaderboard
      const allPlayers = [...initial, {
        rank: 99,
        name: this.user.name + ' (Kamu)',
        score: myPoints,
        completed: myCompleted,
        badge: 'Peserta Expo',
        isMe: true
      }];

      // Urutkan berdasarkan skor tertinggi
      allPlayers.sort((a, b) => b.score - a.score);
      allPlayers.forEach((p, idx) => p.rank = idx + 1);

      // Render Podium (Top 3)
      const top1 = allPlayers[0];
      const top2 = allPlayers[1];
      const top3 = allPlayers[2];

      const p1Name = document.getElementById('podium1Name');
      const p1Pts = document.getElementById('podium1Pts');
      const p2Name = document.getElementById('podium2Name');
      const p2Pts = document.getElementById('podium2Pts');
      const p3Name = document.getElementById('podium3Name');
      const p3Pts = document.getElementById('podium3Pts');

      if (p1Name && top1) { p1Name.textContent = top1.name; p1Pts.textContent = top1.score + ' pts'; }
      if (p2Name && top2) { p2Name.textContent = top2.name; p2Pts.textContent = top2.score + ' pts'; }
      if (p3Name && top3) { p3Name.textContent = top3.name; p3Pts.textContent = top3.score + ' pts'; }

      // Render List
      const listEl = document.getElementById('leaderboardList');
      if (!listEl) return;
      listEl.innerHTML = '';

      allPlayers.slice(3, 10).forEach(player => {
        const row = document.createElement('div');
        row.className = `lb-row-item ${player.isMe ? 'my-rank' : ''}`;
        row.innerHTML = `
          <div class="lb-rank-num">#${player.rank}</div>
          <div class="lb-avatar">${player.name.charAt(0)}</div>
          <div class="lb-info">
            <div class="lb-name-text">${player.name}</div>
            <div class="lb-badge-text">${player.completed} titik selesai · ${player.badge}</div>
          </div>
          <div class="lb-score-text">${player.score} pts</div>
        `;
        listEl.appendChild(row);
      });
    }

    openProfileModal() {
      const loggedView = document.getElementById('profileLoggedInView');
      const guestView = document.getElementById('profileGuestView');
      const nameDisp = document.getElementById('profDisplayName');
      const identDisp = document.getElementById('profDisplayIdent');
      const btnSwitch = document.getElementById('btnSwitchAccount');
      const btnOpenAuth = document.getElementById('btnOpenAuthFromProf');

      if (this.user.identifier) {
        if (loggedView) loggedView.style.display = 'block';
        if (guestView) guestView.style.display = 'none';
        if (nameDisp) nameDisp.textContent = this.user.name;
        if (identDisp) identDisp.textContent = this.user.identifier;
      } else {
        if (loggedView) loggedView.style.display = 'none';
        if (guestView) guestView.style.display = 'block';
      }

      if (btnSwitch && !btnSwitch._hasListener) {
        btnSwitch._hasListener = true;
        btnSwitch.addEventListener('click', () => {
          if (confirm('Keluar dari akun ini di perangkat ini?')) {
            localStorage.removeItem('jelajah_user');
            this.user = this.loadUser();
            this.updateUI();
            this.elProfileModal.classList.remove('active');
            this.openAuthModal();
          }
        });
      }

      if (btnOpenAuth && !btnOpenAuth._hasListener) {
        btnOpenAuth._hasListener = true;
        btnOpenAuth.addEventListener('click', () => {
          this.elProfileModal.classList.remove('active');
          this.openAuthModal();
        });
      }

      if (this.elProfileModal) {
        this.sound.openModal();
        this.elProfileModal.classList.add('active');
      }
    }

    updateUI() {
      const pts = this.getAvailablePoints();
      const totalLocs = window.JELAJAH_DATA.locations.length;
      const completed = this.user.completedMissions.length;
      const pct = Math.round((completed / totalLocs) * 100) || 0;

      if (this.elNavPoints) this.elNavPoints.textContent = pts;
      if (this.elProgressFill) this.elProgressFill.style.width = pct + '%';
      if (this.elProgressPct) this.elProgressPct.textContent = pct + '%';
      if (this.elCompletedCount) this.elCompletedCount.textContent = `${completed}/${totalLocs} Selesai`;

      const quickName = document.getElementById('quickUserName');
      if (quickName) quickName.textContent = this.user.name;
    }

    showToast(message) {
      if (!this.elToast || !this.elToastText) return;
      this.elToastText.textContent = message;
      this.elToast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        this.elToast.classList.remove('show');
      }, 2400);
    }
  }

  // Boot on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new JelajahApp();
  });
})();

// 《主角》问答 H5 — 音频系统
// Web Audio API 合成音效 + BGM 框架 + 静音切换

const AudioManager = {
  ctx: null,
  enabled: true,
  bgmNode: null,
  bgmGain: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  },

  async unlock() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.enabled ? 0.15 : 0;
    }
    const btn = document.getElementById('audio-toggle');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
    return this.enabled;
  },

  // --- SFX 合成 ---

  _playTone(freq, type, duration, vol = 0.15, ramp = true) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  btnTap()    { this._playTone(800, 'sine', 0.08, 0.1); },
  optionSel() { this._playTone(1200, 'triangle', 0.06, 0.08); },
  correct() {
    if (!this.enabled || !this.ctx) return;
    [523, 659, 784].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
    });
  },
  wrong() {
    this._playTone(150, 'square', 0.25, 0.08);
  },
  slide() {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.05;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.1);
  },
  reveal() {
    this._playTone(100, 'sine', 0.4, 0.2, false);
    setTimeout(() => this._playTone(130, 'sine', 0.3, 0.1, true), 200);
  },
  done() {
    this._playTone(2000, 'triangle', 0.15, 0.1);
  },

  // --- BGM 框架 (当前静默占位) ---
  startBGM(src) {
    if (!this.ctx || !src) return;
    // 占位：正式 BGM 替换此处
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.enabled ? 0.15 : 0;
    }
  },

  stopBGM() {
    if (this.bgmGain) {
      this.bgmGain.gain.value = 0;
    }
  }
};

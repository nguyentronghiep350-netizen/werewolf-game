// Web Audio API Sound Effects Synthesizer - Không cần tải file ngoài, hoạt động 100% offline
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambienceNode = null;
    this.ambienceGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.ambienceGain) {
      this.ambienceGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.muted;
  }

  // 1. Tiếng sói hú bí ẩn (Howl)
  playHowl() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Tần số sói hú: từ thấp lên cao rồi xuống dần
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.8);
      osc.frequency.exponentialRampToValueAtTime(320, now + 1.8);
      osc.frequency.exponentialRampToValueAtTime(140, now + 3.0);

      // Bộ lọc lowpass tạo âm thanh vang vọng trong sương mù
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(1000, now + 0.8);
      filter.frequency.linearRampToValueAtTime(400, now + 3.0);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.4);
      gain.gain.setValueAtTime(0.25, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    } catch (e) {
      console.warn('Audio playHowl error:', e);
    }
  }

  // 2. Tiếng gà gáy rạng sáng (Rooster Call)
  playRooster() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 440, time: 0, dur: 0.2 },
        { freq: 554, time: 0.25, dur: 0.2 },
        { freq: 659, time: 0.5, dur: 0.25 },
        { freq: 880, time: 0.8, dur: 0.9 },
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.01, now + time);
        gain.gain.linearRampToValueAtTime(0.2, now + time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch (e) {
      console.warn('Audio playRooster error:', e);
    }
  }

  // 3. Tiếng chuông báo tử ngân vang (Death Bell)
  playDeathBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now); // nốt A3 trầm
      osc.frequency.exponentialRampToValueAtTime(215, now + 2.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.0);
    } catch (e) {
      console.warn('Audio playDeathBell error:', e);
    }
  }

  // 4. Tiếng click nút bấm
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio playClick error:', e);
    }
  }

  // 5. Tiếng bỏ phiếu (Gavel / Vote)
  playVote() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio playVote error:', e);
    }
  }

  // 6. Nhạc mừng chiến thắng (Victory Fanfare)
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0, d: 0.15 }, // C5
        { f: 659.25, t: 0.15, d: 0.15 }, // E5
        { f: 783.99, t: 0.3, d: 0.15 }, // G5
        { f: 1046.5, t: 0.45, d: 0.6 }, // C6
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch (e) {
      console.warn('Audio playVictory error:', e);
    }
  }
}

export const soundFx = new SoundEffects();

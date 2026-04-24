/**
 * Yanbu Elite OS - Audio Governance Service
 * Synthesizes professional alert tones using Web Audio API to avoid external asset dependencies.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx && mute) {
      this.ctx.suspend();
    } else if (this.ctx && !mute) {
      this.ctx.resume();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Pre-Alert: Professional Double-Chime (Sophisticated notification)
   */
  playPreAlert() {
    this.playTone(880, 'sine', 0.5, 0.1);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.5, 0.08), 150);
  }

  /**
   * Violation Alarm: Urgent Pulse (Attention-grabbing but architectural)
   */
  playViolation() {
    this.playTone(440, 'triangle', 0.1, 0.2);
    setTimeout(() => this.playTone(440, 'triangle', 0.1, 0.2), 200);
  }

  /**
   * Success Note: Positively Ascending (Reinforcement)
   */
  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200);
  }

  /**
   * Browser Notification Integration
   */
  sendNotification(title: string, body: string) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }

  requestPermission() {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
}

export const audioService = new AudioService();
